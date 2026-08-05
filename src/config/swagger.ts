import { OpenAPIV3 } from 'openapi-types';

const uuid: OpenAPIV3.SchemaObject = { type: 'string', format: 'uuid' };
const uuidRequired = (description?: string): OpenAPIV3.SchemaObject => ({
  type: 'string',
  format: 'uuid',
  ...(description ? { description } : {}),
});

export const swaggerSpec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'Febe API',
    version: '1.0.0',
    description: 'REST API wrapper for the Febe platform',
  },
  servers: [
    {
      url: `${process.env.FEBE_REST_API_BASE_URL ?? 'http://localhost:8081/api'}`.replace(/\/api$/, ''),
      description: 'Current server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token from /api/auth/signin',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    { name: 'Auth' },
    { name: 'Settings' },
    { name: 'Organization' },
    { name: 'Sub-Organization' },
    { name: 'Environment' },
    { name: 'Project' },
    { name: 'Version' },
    { name: 'Chat History' },
    { name: 'Configuration' },
    { name: 'Deployment Configuration' },
    { name: 'Deployment' },
    { name: 'Health' },
  ],
  paths: {
    // ── Health ──────────────────────────────────────────────────
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        security: [],
        responses: { '200': { description: 'OK' } },
      },
    },

    // ── Auth ────────────────────────────────────────────────────
    '/api/auth/signin': {
      post: {
        tags: ['Auth'],
        summary: 'Sign in',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Signed in successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        email: { type: 'string' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': { description: 'Validation error' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },

    '/api/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Sign up',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'firstName', 'lastName', 'company', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  firstName: { type: 'string', minLength: 1 },
                  middleName: { type: 'string', nullable: true },
                  lastName: { type: 'string', minLength: 1 },
                  company: { type: 'string', minLength: 1 },
                  role: { type: 'string', default: 'user' },
                  password: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'User created' },
          '400': { description: 'Validation error or passwords do not match' },
        },
      },
    },

    '/api/auth/current-user': {
      post: {
        tags: ['Auth'],
        summary: 'Get current user from token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token'],
                properties: {
                  token: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Current user info',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ── Settings ────────────────────────────────────────────────
    '/api/settings/{id}': {
      get: {
        tags: ['Settings'],
        summary: 'Get user settings by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: uuid }],
        responses: { '200': { description: 'User settings' } },
      },
    },

    '/api/settings': {
      put: {
        tags: ['Settings'],
        summary: 'Update user settings',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['id', 'orgId', 'environmentId', 'userId'],
                properties: {
                  id: uuidRequired('Settings ID'),
                  orgId: uuidRequired('Organization ID'),
                  subOrgId: { ...uuid, nullable: true },
                  environmentId: uuidRequired('Environment ID'),
                  userId: uuidRequired('User ID'),
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Settings updated' } },
      },
    },

    // ── Organization ────────────────────────────────────────────
    '/api/organization/hierarchy/{settingsId}': {
      get: {
        tags: ['Organization'],
        summary: 'Get org hierarchy for a settings ID',
        parameters: [{ name: 'settingsId', in: 'path', required: true, schema: uuid }],
        responses: { '200': { description: 'Organization hierarchy' } },
      },
    },

    '/api/organization': {
      put: {
        tags: ['Organization'],
        summary: 'Update organization',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['id', 'name'],
                properties: {
                  id: uuidRequired('Organization ID'),
                  name: { type: 'string', minLength: 1, maxLength: 100 },
                  description: { type: 'string', maxLength: 255 },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Organization updated' } },
      },
    },

    // ── Sub-Organization ─────────────────────────────────────────
    '/api/sub-organization': {
      post: {
        tags: ['Sub-Organization'],
        summary: 'Create sub-organization',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['orgId', 'name'],
                properties: {
                  orgId: uuidRequired('Parent organization ID'),
                  name: { type: 'string', minLength: 1, maxLength: 100 },
                  description: { type: 'string', maxLength: 255 },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Sub-organization created' } },
      },
      put: {
        tags: ['Sub-Organization'],
        summary: 'Update sub-organization',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['id', 'orgId', 'name'],
                properties: {
                  id: uuidRequired('Sub-organization ID'),
                  orgId: uuidRequired('Parent organization ID'),
                  name: { type: 'string', minLength: 1, maxLength: 100 },
                  description: { type: 'string', maxLength: 255 },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Sub-organization updated' } },
      },
    },

    '/api/sub-organization/{id}': {
      delete: {
        tags: ['Sub-Organization'],
        summary: 'Delete sub-organization',
        parameters: [{ name: 'id', in: 'path', required: true, schema: uuid }],
        responses: { '200': { description: 'Deleted' } },
      },
    },

    // ── Environment ──────────────────────────────────────────────
    '/api/environment': {
      post: {
        tags: ['Environment'],
        summary: 'Create environment',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['orgId', 'name'],
                properties: {
                  orgId: uuidRequired('Organization ID'),
                  subOrgId: { ...uuid, nullable: true },
                  name: { type: 'string', minLength: 1, maxLength: 100 },
                  description: { type: 'string', maxLength: 255 },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Environment created' } },
      },
      put: {
        tags: ['Environment'],
        summary: 'Update environment',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['id', 'orgId', 'name'],
                properties: {
                  id: uuidRequired('Environment ID'),
                  orgId: uuidRequired('Organization ID'),
                  subOrgId: { ...uuid, nullable: true },
                  name: { type: 'string', minLength: 1, maxLength: 100 },
                  description: { type: 'string', maxLength: 255 },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Environment updated' } },
      },
    },

    '/api/environment/{id}': {
      delete: {
        tags: ['Environment'],
        summary: 'Delete environment',
        parameters: [{ name: 'id', in: 'path', required: true, schema: uuid }],
        responses: { '200': { description: 'Deleted' } },
      },
    },

    // ── Project ──────────────────────────────────────────────────
    '/api/project': {
      get: {
        tags: ['Project'],
        summary: 'List projects',
        parameters: [
          { name: 'envId', in: 'query', required: true, schema: uuid },
          { name: 'orgId', in: 'query', schema: uuid },
          { name: 'subOrgId', in: 'query', schema: uuid },
          { name: 'rows', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'start', in: 'query', schema: { type: 'integer', default: 0 } },
        ],
        responses: { '200': { description: 'Paginated list of projects' } },
      },
      post: {
        tags: ['Project'],
        summary: 'Create project',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['orgId', 'name', 'environmentId'],
                properties: {
                  orgId: uuidRequired('Organization ID'),
                  subOrgId: { ...uuid, nullable: true },
                  name: { type: 'string', minLength: 1, maxLength: 100 },
                  description: { type: 'string', maxLength: 255, nullable: true },
                  environmentId: uuidRequired('Environment ID'),
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Project created' } },
      },
      put: {
        tags: ['Project'],
        summary: 'Update project',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['id', 'orgId', 'name', 'environmentId'],
                properties: {
                  id: uuidRequired('Project ID'),
                  orgId: uuidRequired('Organization ID'),
                  subOrgId: { ...uuid, nullable: true },
                  name: { type: 'string', minLength: 1, maxLength: 100 },
                  description: { type: 'string', maxLength: 255, nullable: true },
                  environmentId: uuidRequired('Environment ID'),
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Project updated' } },
      },
    },

    '/api/project/hierarchy': {
      get: {
        tags: ['Project'],
        summary: 'List projects with their versions',
        parameters: [
          { name: 'envId', in: 'query', required: true, schema: uuid },
          { name: 'orgId', in: 'query', schema: uuid },
          { name: 'subOrgId', in: 'query', schema: uuid },
          { name: 'rows', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'start', in: 'query', schema: { type: 'integer', default: 0 } },
        ],
        responses: { '200': { description: 'Projects with nested versions' } },
      },
    },

    '/api/project/{id}': {
      get: {
        tags: ['Project'],
        summary: 'Get project by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: uuid }],
        responses: { '200': { description: 'Project' } },
      },
      delete: {
        tags: ['Project'],
        summary: 'Delete project',
        parameters: [{ name: 'id', in: 'path', required: true, schema: uuid }],
        responses: { '200': { description: 'Deleted' } },
      },
    },

    // ── Version ──────────────────────────────────────────────────
    '/api/version': {
      get: {
        tags: ['Version'],
        summary: 'List versions for a project',
        parameters: [
          { name: 'projectId', in: 'query', required: true, schema: uuid },
          { name: 'status', in: 'query', schema: { type: 'integer' } },
          { name: 'rows', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'start', in: 'query', schema: { type: 'integer', default: 0 } },
          { name: 'sort', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'Paginated list of versions' } },
      },
      put: {
        tags: ['Version'],
        summary: 'Update version',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['id', 'projectId'],
                properties: {
                  id: uuidRequired('Version ID'),
                  projectId: uuidRequired('Project ID'),
                  name: { type: 'string', maxLength: 100 },
                  description: { type: 'string', maxLength: 255, nullable: true },
                  schemaJson: { type: 'string' },
                  status: { type: 'integer', default: 1 },
                  notes: { type: 'string' },
                  domain: { type: 'string', format: 'uri', nullable: true },
                  graphQlUrl: { type: 'string', format: 'uri', nullable: true },
                  restUrl: { type: 'string', format: 'uri', nullable: true },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Version updated' } },
      },
    },

    '/api/version/save': {
      post: {
        tags: ['Version'],
        summary: 'Save (create) a version',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['projectId', 'name'],
                properties: {
                  projectId: uuidRequired('Project ID'),
                  name: { type: 'string', minLength: 1, maxLength: 100 },
                  description: { type: 'string', maxLength: 255, nullable: true },
                  schemaJson: { type: 'string' },
                  status: { type: 'integer', default: 1 },
                  notes: { type: 'string' },
                  domain: { type: 'string', format: 'uri', nullable: true },
                  graphQlUrl: { type: 'string', format: 'uri', nullable: true },
                  restUrl: { type: 'string', format: 'uri', nullable: true },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Version saved' } },
      },
    },

    '/api/version/publish': {
      post: {
        tags: ['Version'],
        summary: 'Publish a version',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['id', 'settingsId', 'projectId', 'projectName', 'schemaJson', 'transformedJson'],
                properties: {
                  id: uuidRequired('Version ID'),
                  settingsId: uuidRequired('Settings ID'),
                  projectId: uuidRequired('Project ID'),
                  projectName: { type: 'string' },
                  schemaJson: { type: 'string' },
                  transformedJson: { type: 'object', additionalProperties: true },
                  incrementType: {
                    type: 'string',
                    enum: ['major', 'minor', 'patch'],
                    default: 'major',
                  },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Version published' } },
      },
    },

    '/api/version/deploy': {
      post: {
        tags: ['Version'],
        summary: 'Deploy a version',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', additionalProperties: true },
            },
          },
        },
        responses: { '200': { description: 'Version deployed' } },
      },
    },

    '/api/version/{id}': {
      get: {
        tags: ['Version'],
        summary: 'Get version by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: uuid }],
        responses: { '200': { description: 'Version' } },
      },
      delete: {
        tags: ['Version'],
        summary: 'Delete version',
        parameters: [{ name: 'id', in: 'path', required: true, schema: uuid }],
        responses: { '200': { description: 'Deleted' } },
      },
    },

    // ── Chat History ─────────────────────────────────────────────
    '/api/chat-history': {
      get: {
        tags: ['Chat History'],
        summary: 'Get chat history for a user/project',
        parameters: [
          { name: 'userId', in: 'query', required: true, schema: uuid },
          { name: 'projectId', in: 'query', required: true, schema: uuid },
          { name: 'rows', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'start', in: 'query', schema: { type: 'integer', default: 0 } },
        ],
        responses: { '200': { description: 'Paginated chat history' } },
      },
      post: {
        tags: ['Chat History'],
        summary: 'Add chat history entry',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'projectId', 'role', 'message'],
                properties: {
                  userId: uuidRequired('User ID'),
                  projectId: uuidRequired('Project ID'),
                  role: { type: 'string', example: 'user' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Entry added' } },
      },
    },

    '/api/chat-history/{id}': {
      delete: {
        tags: ['Chat History'],
        summary: 'Delete chat history entry',
        parameters: [{ name: 'id', in: 'path', required: true, schema: uuid }],
        responses: { '200': { description: 'Deleted' } },
      },
    },

    // ── Configuration ────────────────────────────────────────────
    '/api/configuration': {
      get: {
        tags: ['Configuration'],
        summary: 'List configurations',
        parameters: [
          { name: 'rows', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'start', in: 'query', schema: { type: 'integer', default: 0 } },
        ],
        responses: { '200': { description: 'Paginated list of configurations' } },
      },
      post: {
        tags: ['Configuration'],
        summary: 'Create configuration',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['replicaSize'],
                properties: {
                  replicaSize: { type: 'string', minLength: 1, maxLength: 100 },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Configuration created' } },
      },
      put: {
        tags: ['Configuration'],
        summary: 'Update configuration',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['id', 'replicaSize'],
                properties: {
                  id: uuidRequired('Configuration ID'),
                  replicaSize: { type: 'string', minLength: 1, maxLength: 100 },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Configuration updated' } },
      },
    },

    '/api/configuration/{id}': {
      get: {
        tags: ['Configuration'],
        summary: 'Get configuration by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: uuid }],
        responses: { '200': { description: 'Configuration' } },
      },
      delete: {
        tags: ['Configuration'],
        summary: 'Delete configuration',
        parameters: [{ name: 'id', in: 'path', required: true, schema: uuid }],
        responses: { '200': { description: 'Deleted' } },
      },
    },

    // ── Deployment Configuration ─────────────────────────────────
    '/api/deployment-configuration': {
      get: {
        tags: ['Deployment Configuration'],
        summary: 'List deployment configurations',
        parameters: [
          { name: 'rows', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'start', in: 'query', schema: { type: 'integer', default: 0 } },
        ],
        responses: { '200': { description: 'Paginated list' } },
      },
      post: {
        tags: ['Deployment Configuration'],
        summary: 'Create deployment configuration',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['configurationId', 'replicaCount'],
                properties: {
                  configurationId: uuidRequired('Configuration ID'),
                  replicaCount: { type: 'string', minLength: 1, maxLength: 100 },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Created' } },
      },
      put: {
        tags: ['Deployment Configuration'],
        summary: 'Update deployment configuration',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['id', 'configurationId', 'replicaCount'],
                properties: {
                  id: uuidRequired('Deployment Configuration ID'),
                  configurationId: uuidRequired('Configuration ID'),
                  replicaCount: { type: 'string', minLength: 1, maxLength: 100 },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Updated' } },
      },
    },

    '/api/deployment-configuration/{id}': {
      get: {
        tags: ['Deployment Configuration'],
        summary: 'Get deployment configuration by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: uuid }],
        responses: { '200': { description: 'Deployment configuration' } },
      },
      delete: {
        tags: ['Deployment Configuration'],
        summary: 'Delete deployment configuration',
        parameters: [{ name: 'id', in: 'path', required: true, schema: uuid }],
        responses: { '200': { description: 'Deleted' } },
      },
    },

    // ── Deployment ───────────────────────────────────────────────
    '/api/deployment': {
      get: {
        tags: ['Deployment'],
        summary: 'List deployments',
        parameters: [
          { name: 'rows', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'start', in: 'query', schema: { type: 'integer', default: 0 } },
        ],
        responses: { '200': { description: 'Paginated list of deployments' } },
      },
      post: {
        tags: ['Deployment'],
        summary: 'Create deployment',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['projectId', 'versionId', 'deploymentConfigurationId', 'deployedBy', 'status'],
                properties: {
                  projectId: uuidRequired('Project ID'),
                  versionId: uuidRequired('Version ID'),
                  deploymentConfigurationId: uuidRequired('Deployment Configuration ID'),
                  deployedBy: { type: 'string', minLength: 1, maxLength: 100 },
                  status: { type: 'string', minLength: 1, maxLength: 100 },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Deployment created' } },
      },
      put: {
        tags: ['Deployment'],
        summary: 'Update deployment',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['id', 'projectId', 'versionId', 'deploymentConfigurationId', 'deployedBy', 'status'],
                properties: {
                  id: uuidRequired('Deployment ID'),
                  projectId: uuidRequired('Project ID'),
                  versionId: uuidRequired('Version ID'),
                  deploymentConfigurationId: uuidRequired('Deployment Configuration ID'),
                  deployedBy: { type: 'string', minLength: 1, maxLength: 100 },
                  status: { type: 'string', minLength: 1, maxLength: 100 },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Deployment updated' } },
      },
    },

    '/api/deployment/{id}': {
      get: {
        tags: ['Deployment'],
        summary: 'Get deployment by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: uuid }],
        responses: { '200': { description: 'Deployment' } },
      },
      delete: {
        tags: ['Deployment'],
        summary: 'Delete deployment',
        parameters: [{ name: 'id', in: 'path', required: true, schema: uuid }],
        responses: { '200': { description: 'Deleted' } },
      },
    },
  },
};
