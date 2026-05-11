/**
 * JSON Schemas for weather API request validation
 */
export const reportSchema = {
  type: 'object',
  required: ['CameraId', 'IsRaining'],
  properties: {
    CameraId: { type: 'string', minLength: 1 },
    IsRaining: { type: 'boolean' },
    Note: { type: ['string', 'null'] },
  },
  additionalProperties: false,
} as const;

export const checkRouteSchema = {
  type: 'array',
  minItems: 2,
  items: {
    type: 'object',
    required: ['Lat', 'Lng'],
    properties: {
      Lat: { type: 'number' },
      Lng: { type: 'number' },
    },
    additionalProperties: false,
  },
} as const;
