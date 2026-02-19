export const enum FebeAPIConstants {
  SIGN_IN = '/user-authentication',
  SIGN_UP = '/userSignUp',
  ACTIVATE_USER = '/activate-user-new',

  GET_USER = '/user',
  GET_CURRENT_USER = '/me',

  USER_SETTINGS_BASE = '/userSetting',

  GET_ORGANIZATIONS = '/organization',
  CREATE_ORGANIZATION = '/organization',
  UPDATE_ORGANIZATION = '/organization',
  DELETE_ORGANIZATION = '/organization',

  CREATE_SUB_ORG = '/subOrganization',
  UPDATE_SUB_ORG = '/subOrganization',
  DELETE_SUB_ORG = '/subOrganization',

  CREATE_ENVIRONMENT = '/environment',
  UPDATE_ENVIRONMENT = '/environment',
  DELETE_ENVIRONMENT = '/environment',

  CREATE_USER_ORG_MAPPING = '/userOrg',
  
  PROJECT_BASE = '/project',
  VERSION_BASE = '/version',
  CHAT_HISTORY_BASE = '/chatHistory',

  CONFIGURATION_BASE = '/configuration',
  DEPLOYMENT_CONFIGURATION_BASE = '/deploymentConfiguration',
  DEPLOYMENT_BASE = '/deployment',
}