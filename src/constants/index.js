/**
 * Global application constants.
 * Separating constants ensures that common values (like status codes, roles, 
 * or schemas enums) are defined once, making updating validation or rules painless.
 */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

export const CONFLICT_TYPES = [
  'World War',
  'Civil War',
  'Interstate War',
  'Asymmetric War',
  'Interstate/Counter-insurgency',
];

export const CONFLICT_STATUSES = [
  'Ongoing',
  'Resolved',
];

export const BLACK_MARKET_LEVELS = [
  'Low',
  'Moderate',
  'High',
  'Dominant',
];
