/**
 * JSON Schemas for auth request validation (mirror backend)
 */
export const registerSchema = {
  type: 'object',
  required: ['Username', 'Email', 'Password'],
  properties: {
    Username: { type: 'string', minLength: 1 },
    Email: { type: 'string', format: 'email' },
    Password: { type: 'string', minLength: 6 },
  },
  additionalProperties: false,
} as const;

export const loginSchema = {
  type: 'object',
  required: ['Username', 'Password'],
  properties: {
    Username: { type: 'string', minLength: 1 },
    Password: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
} as const;

export const forgotPasswordSchema = {
  type: 'object',
  required: ['Email'],
  properties: {
    Email: { type: 'string', format: 'email' },
  },
  additionalProperties: false,
} as const;

export const resetPasswordSchema = {
  type: 'object',
  required: ['Token', 'NewPassword'],
  properties: {
    Token: { type: 'string', minLength: 1 },
    NewPassword: { type: 'string', minLength: 6 },
  },
  additionalProperties: false,
} as const;

export const changePasswordSchema = {
  type: 'object',
  required: ['OldPassword', 'NewPassword'],
  properties: {
    OldPassword: { type: 'string', minLength: 1 },
    NewPassword: { type: 'string', minLength: 6 },
  },
  additionalProperties: false,
} as const;

export const updateProfileSchema = {
  type: 'object',
  properties: {
    FullName: { type: ['string', 'null'] },
    PhoneNumber: { type: ['string', 'null'] },
    AvatarUrl: { type: ['string', 'null'] },
  },
  additionalProperties: false,
} as const;
