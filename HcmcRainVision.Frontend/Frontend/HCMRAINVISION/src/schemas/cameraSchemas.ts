/**
 * JSON Schemas for camera API request validation (Admin)
 */
export const createCameraSchema = {
  type: 'object',
  required: ['Id', 'Name', 'Latitude', 'Longitude', 'StreamUrl'],
  properties: {
    Id: { type: 'string', minLength: 3, maxLength: 50 },
    Name: { type: 'string', minLength: 5, maxLength: 200 },
    Latitude: { type: 'number', minimum: 10, maximum: 11 },
    Longitude: { type: 'number', minimum: 106, maximum: 107 },
    WardId: { type: ['string', 'null'], maxLength: 50 },
    StreamUrl: { type: 'string', format: 'uri' },
    StreamType: { type: ['string', 'null'], maxLength: 20 },
  },
  additionalProperties: false,
} as const;

export const updateCameraSchema = {
  type: 'object',
  required: ['Name', 'Latitude', 'Longitude'],
  properties: {
    Name: { type: 'string', minLength: 5, maxLength: 200 },
    Latitude: { type: 'number', minimum: 10, maximum: 11 },
    Longitude: { type: 'number', minimum: 106, maximum: 107 },
    WardId: { type: ['string', 'null'], maxLength: 50 },
    Status: { type: ['string', 'null'], maxLength: 20 },
    StreamUrl: { type: ['string', 'null'], format: 'uri' },
  },
  additionalProperties: false,
} as const;
