/**
 * JSON Schemas for subscription request validation
 */
export const createSubscriptionSchema = {
  type: 'object',
  required: ['WardId'],
  properties: {
    WardId: { type: 'string', minLength: 1 },
    ThresholdProbability: { type: 'number', minimum: 0, maximum: 1 },
  },
  additionalProperties: false,
} as const;

export const updateSubscriptionSchema = {
  type: 'object',
  required: ['ThresholdProbability', 'IsEnabled'],
  properties: {
    ThresholdProbability: { type: 'number', minimum: 0, maximum: 1 },
    IsEnabled: { type: 'boolean' },
  },
  additionalProperties: false,
} as const;
