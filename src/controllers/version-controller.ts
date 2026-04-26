import { Request, Response } from 'express';
import { versionService } from '../services/version-service';
import { areJsonObjectsEqual, escapeJson, unescapeJson } from '../utils/common';
import { createFQDN } from '../utils/dns';
import { userSettingService } from '../services/user-settings-service';
import { AppError } from '../utils/app-error';
import { projectService } from '../services/project-service';
import { transformSchema } from '../utils/transform-schema';
import { configurationService } from '../services/configuration-service';
import { deploymentService } from '../services/deployment-service';

export async function getVersions(req: any, res: Response) {
  // Uses any/Request because query types are validated by middleware
  const data = await versionService.getByQuery(req.query as any);
  return res.status(200).json(data);
}

export async function getVersionById(req: any, res: Response) {
  const data = await versionService.getVersionById(req.params.id);
  return res.status(200).json(data);
}

// Deprecated: No longer used with the new saveVersion/publishVersion flow
export async function addVersion(req: Request, res: Response) {
  throw new AppError('Use saveVersion instead to create new versions.', 400);
}

export async function updateVersion(req: Request, res: Response) {
  const data = await versionService.update(req.body);
  return res.status(200).json(data);
}

export async function deleteVersion(req: Request, res: Response) {
  const data = await versionService.remove(req.params.id);
  return res.status(200).json(data);
}

export async function saveVersion(req: Request, res: Response) {
  const { projectId, description, schemaJson } = req.body;
  // const schemaJsonObj = escapeJson(schemaJson);
  // 1. Determine the base version for the snapshot
  const latestPublished = (
    await versionService.getByQuery({
      projectId: projectId,
      status: 3, // Only consider published versions for base
      rows: 1,
      start: 0,
      sort: 'createdAt desc',
    })
  )?.data[0];
  const baseForSnapshot = latestPublished?.name || '0.0.0'; // e.g., '1.0.0' or '0.0.0'

  // 2. Get the next snapshot version name
  const nextSnapshotVersionName = await versionService.getNextSnapshotVersion(
    projectId,
    baseForSnapshot
  );

  // 3. Create a new version record
  const createdVersion = await versionService.create({
    projectId,
    name: nextSnapshotVersionName,
    description: description,
    schemaJson: schemaJson,
    status: 1, // Created/Draft
  });

  return res.status(201).json(createdVersion);
}

export async function publishVersion(req: Request, res: Response) {
  if (!process.env.SCHEMA_PUBLISH_URL) {
    throw new AppError('Schema publish location url not set', 502);
  }
  const {
    settingsId,
    projectId,
    projectName,
    schemaJson,
    transformedJson,
    description,
    incrementType,
  } = req.body;
  const userSettings = await userSettingService.getByQuery(`ID:${settingsId}`);

  // Parse the incoming escaped schemaJson once so all comparisons work against objects
  const parsedSchemaJson = unescapeJson(schemaJson);
  if (!parsedSchemaJson) {
    throw new AppError('Invalid schemaJson in request body', 400);
  }

  // 1. Determine the next formal (published) version name
  const nextFormalVersionName = await versionService.getNextFormalVersion(
    projectId,
    parsedSchemaJson,
    incrementType || 'minor'
  ); // Default to minor if not provided

  let versionRecordIdToPublish: string;

  // Try to find an existing draft that matches the incoming schemaJson for potential update
  const versions = await versionService.getByQuery({
    projectId: projectId,
    status: 1, // Look for created/draft versions
    rows: 100, // Fetch more to find a matching schema, or implement a more targeted query if possible
    start: 0,
    sort: 'createdAt desc',
  });

  const matchingDraft = versions.data.find((v) =>
    areJsonObjectsEqual(unescapeJson(v.schemaJson ?? ''), parsedSchemaJson, [
      'createdAt',
      'updatedAt',
    ])
  );

  if (matchingDraft) {
    // If a matching draft exists, update its status and assign the formal name
    const updatedVersion = await versionService.update({
      id: matchingDraft.id,
      name: nextFormalVersionName,
      description: description || matchingDraft.description,
      status: 2, // Publishing
      projectId: projectId,
    });
    versionRecordIdToPublish = updatedVersion.id;
  } else {
    // No matching draft, create a new record for this formal version
    const createdVersion = await versionService.create({
      projectId,
      name: nextFormalVersionName,
      description: description,
      schemaJson: schemaJson,
      status: 2, // Publishing
    });
    versionRecordIdToPublish = createdVersion.id;
  }

  // 2. Construct payload and publish to external service
  const domain = createFQDN(projectName, 'us-east-2');
  const payload = {
    event_type: 'custom_event',
    client_payload: {
      success: 'ok',
      message: 'Data sent to backend successfully',
      data: {
        ID: versionRecordIdToPublish,
        graphID: projectId,
        projectName: projectName,
        enviromentID: userSettings.environmentId,
        organizationID: userSettings.orgId,
        subOrganizationID: userSettings.subOrgId,
        version: nextFormalVersionName,
        domain,
        tables: transformedJson.tables,
      },
    },
  };
  console.log("🚀 ~ publishVersion ~ payload:", payload)

  try {
    const response = await versionService.publish(
      process.env.SCHEMA_PUBLISH_URL,
      payload
    );

    // 3. Update status to 'published' on successful external publication
    await versionService.update({
      id: versionRecordIdToPublish,
      projectId,
      name: nextFormalVersionName,
      status: 3, // Published
    });
    return res.status(response.status).send('Schema published successfully!');
  } catch (error: any) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to publish schema.';
    throw new AppError(message, statusCode);
  }
}

export async function deployVersion(req: Request, res: Response) {
  if (!process.env.SCHEMA_DEPLOY_URL) {
    throw new AppError('Schema publish location url not set', 502);
  }

  const {
    runtimeVersionId: versionId,
    settingsId,
    projectId,
    projectName,
    selectedConfigId,
    replicas,
    deploymentModel
  } = req.body;

  const version = await versionService.getVersionById(versionId);
  const transformedJson = transformSchema(unescapeJson(version.schemaJson || '')) as any;

  const config = {
    replicaCount: replicas,
    replicaSize: {
      id: selectedConfigId,
      cpu: '.25VCore',
      memory: '500 MB memory',
    },
    deploymentModel: deploymentModel,
    releaseChannel: 'long-term-support',
  };

  const userSettings = await userSettingService.getByQuery(`ID:${settingsId}`);

  const payload = {
    event_type: 'RancherK8s',
    client_payload: {
      success: 'ok',
      message: 'Data sent to backend successfully',
      configuration: config,
      data: {
        ID: versionId,
        graphID: projectId,
        projectName: projectName,
        enviromentID: userSettings.environmentId,
        organizationID: userSettings.orgId,
        subOrganizationID: userSettings.subOrgId || '',
        version: version.name,
        tables: transformedJson.tables,
      },
    },
  };

  try {
    const response = await versionService.deploy(
      process.env.SCHEMA_DEPLOY_URL,
      payload
    );

    const deployment = await deploymentService.create({
      projectId,
      versionId,
      deploymentConfigurationId: selectedConfigId,
      deployedBy: 'jbehera',
      status: 'pending'
    });

    console.log(deployment);
    return res.status(response.status).send('Schema deployed successfully!');
  } catch (error) {
    // 4. Handle publish failure: revert status
    console.error('Schema deploy failed:', error);
    throw new AppError('Failed to deploy schema.', 500);
  }
}
