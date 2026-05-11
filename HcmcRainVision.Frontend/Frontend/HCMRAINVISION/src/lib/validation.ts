/**
 * JSON Schema validation with Ajv. Use before sending request payloads.
 */
import Ajv, { type ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import * as authSchemas from '../schemas/authSchemas';
import * as subscriptionSchemas from '../schemas/subscriptionSchemas';
import * as weatherSchemas from '../schemas/weatherSchemas';
import * as cameraSchemas from '../schemas/cameraSchemas';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const validators = {
  register: ajv.compile(authSchemas.registerSchema),
  login: ajv.compile(authSchemas.loginSchema),
  forgotPassword: ajv.compile(authSchemas.forgotPasswordSchema),
  resetPassword: ajv.compile(authSchemas.resetPasswordSchema),
  changePassword: ajv.compile(authSchemas.changePasswordSchema),
  updateProfile: ajv.compile(authSchemas.updateProfileSchema),
  createSubscription: ajv.compile(subscriptionSchemas.createSubscriptionSchema),
  updateSubscription: ajv.compile(subscriptionSchemas.updateSubscriptionSchema),
  report: ajv.compile(weatherSchemas.reportSchema),
  checkRoute: ajv.compile(weatherSchemas.checkRouteSchema),
  createCamera: ajv.compile(cameraSchemas.createCameraSchema),
  updateCamera: ajv.compile(cameraSchemas.updateCameraSchema),
};

export type ValidatorName = keyof typeof validators;

export interface ValidationResult<T = unknown> {
  valid: boolean;
  data?: T;
  errors: ErrorObject[] | null;
  firstMessage: string | null;
}

function firstMessage(errors: ErrorObject[] | null): string | null {
  if (!errors?.length) return null;
  const e = errors[0];
  const msg = e.message ?? `${e.instancePath || 'field'} ${e.keyword}`;
  return msg;
}

export function validate<K extends ValidatorName>(
  name: K,
  data: unknown
): ValidationResult {
  const validateFn = validators[name];
  const valid = validateFn(data);
  const errors = validateFn.errors ?? null;
  return {
    valid: !!valid,
    data: valid ? (data as never) : undefined,
    errors,
    firstMessage: firstMessage(errors),
  };
}

/** Validate and return data or throw with first error message */
export function validateOrThrow<T>(name: ValidatorName, data: unknown): T {
  const result = validate(name, data);
  if (result.valid && result.data !== undefined) return result.data as T;
  throw new Error(result.firstMessage ?? 'Validation failed');
}
