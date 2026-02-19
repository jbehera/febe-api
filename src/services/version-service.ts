import axios from 'axios';
import { httpClient } from '../utils/http-client';
import { FebeAPIConstants } from '../constants';
import {
  Version,
  VersionCreateReq,
  VersionListReq,
  VersionUpdateReq,
} from '../schemas';
import { incrementVersion, areJsonObjectsEqual, unescapeJson } from '../utils/common';
import { AppError } from '../utils/app-error';

export const versionService = {
  async getByQuery(parsedQs: VersionListReq) {
    const { rows, start, sort, projectId, status } = parsedQs;
    const query = status ? `projectId:${projectId} && status:${status}` : `projectId:${projectId}`;
    const { data } = await httpClient.get(
      FebeAPIConstants.VERSION_BASE,
      Version.ListRes,
      {
        params: { query, rows, start, sort },
      }
    );
    return data;
  },

  async getVersionById(id: string) {
    const { data } = await httpClient.get(
      FebeAPIConstants.VERSION_BASE,
      Version.ListRes,
      {
        params: { query: `ID:${id}` },
      }
    );

    return data?.data[0];
  },

  async create(payload: VersionCreateReq) {
    const { data } = await httpClient.post(
      FebeAPIConstants.VERSION_BASE,
      payload,
      Version.ListItemRes
    );
    return data;
  },

  async update(payload: VersionUpdateReq) {
    const transformedPayload = Version.Update.parse(payload);
    const { data } = await httpClient.put(
      FebeAPIConstants.VERSION_BASE,
      transformedPayload,
      Version.ListItemRes
    );
    return data;
  },

  async remove(id: string) {
    const { data } = await httpClient.delete(
      FebeAPIConstants.VERSION_BASE,
      Version.DeleteRes,
      { params: { query: `ID:${id}` } }
    );
    return data;
  },

  async publish(url: string, payload:unknown) {
    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "token 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",
        "Accept": "application/vnd.github.v3+json",
      },
    });
    return response;
  },

  async getNextSnapshotVersion(projectId: string, baseSchemaVersion: string): Promise<string> {
    const latestSnapshot = await versionService.getByQuery({
      projectId: projectId,
      sort: 'createdAt desc',
      rows: 1,
      start: 0,
    });

    const currentBaseVersion = baseSchemaVersion.startsWith('v') ? baseSchemaVersion.substring(1) : baseSchemaVersion;

    const existingSnapshot = latestSnapshot.data[0];

    if (existingSnapshot && existingSnapshot.name.startsWith(currentBaseVersion) && existingSnapshot.name.includes('-snapshot.')) {
        return incrementVersion(existingSnapshot.name, 'snapshot');
    }

    // If no existing snapshot for this base version, start with .1
    return `${currentBaseVersion}-snapshot.1`;
  },

  async getNextFormalVersion(projectId: string, incomingSchemaJson: any, incrementType: 'major' | 'minor' | 'patch'): Promise<string> {
    const latestPublished = (await versionService.getByQuery({
      projectId: projectId,
      sort: 'createdAt desc',
      rows: 1,
      start: 0,
    }))?.data[0];

    if (!latestPublished) {
      return '1.0.0'; // First formal version
    }

    const currentPublishedSchemaJson = unescapeJson(latestPublished.schemaJson || "");

    if (areJsonObjectsEqual(currentPublishedSchemaJson, incomingSchemaJson, ['createdAt', 'updatedAt'])) {
      throw new AppError('No schema changes detected to publish. The incoming schema is identical to the latest published version.', 409);
    }
    
    // Check if the incrementType makes sense.
    const [currentMajor, currentMinor, currentPatch] = latestPublished.name.split('.').map(Number);
    const [nextMajor, nextMinor, nextPatch] = incrementVersion(latestPublished.name, incrementType).split('.').map(Number);

    if (incrementType === 'major' && (nextMajor <= currentMajor || nextMinor > 0 || nextPatch > 0)) {
      throw new AppError('Invalid major increment. Next major version should be greater than current, with minor and patch reset to 0.', 400);
    }
    if (incrementType === 'minor' && (nextMajor !== currentMajor || nextMinor <= currentMinor || nextPatch > 0)) {
      throw new AppError('Invalid minor increment. Next minor version should be greater than current, with patch reset to 0.', 400);
    }
    if (incrementType === 'patch' && (nextMajor !== currentMajor || nextMinor !== currentMinor || nextPatch <= currentPatch)) {
      throw new AppError('Invalid patch increment. Next patch version should be greater than current.', 400);
    }
    
    return incrementVersion(latestPublished.name, incrementType);
  }
};
