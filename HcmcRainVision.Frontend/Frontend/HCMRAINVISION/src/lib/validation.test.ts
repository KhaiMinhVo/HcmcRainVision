/**
 * Unit tests for request payload validation (mirror backend rules)
 */
import { describe, it, expect } from 'vitest';
import { validate } from './validation';

describe('validation', () => {
  describe('register', () => {
    it('accepts valid Username, Email, Password (min 6)', () => {
      const r = validate('register', {
        Username: 'user1',
        Email: 'a@b.com',
        Password: '123456',
      });
      expect(r.valid).toBe(true);
      expect(r.errors).toBeNull();
    });

    it('rejects missing Username', () => {
      const r = validate('register', { Username: '', Email: 'a@b.com', Password: '123456' });
      expect(r.valid).toBe(false);
    });

    it('rejects invalid Email', () => {
      const r = validate('register', { Username: 'u', Email: 'not-email', Password: '123456' });
      expect(r.valid).toBe(false);
    });

    it('rejects Password shorter than 6', () => {
      const r = validate('register', { Username: 'u', Email: 'a@b.com', Password: '12345' });
      expect(r.valid).toBe(false);
    });
  });

  describe('login', () => {
    it('accepts valid Username and Password', () => {
      const r = validate('login', { Username: 'user', Password: 'secret' });
      expect(r.valid).toBe(true);
    });

    it('rejects empty Username', () => {
      const r = validate('login', { Username: '', Password: 'x' });
      expect(r.valid).toBe(false);
    });
  });

  describe('forgotPassword', () => {
    it('accepts valid Email', () => {
      const r = validate('forgotPassword', { Email: 'user@example.com' });
      expect(r.valid).toBe(true);
    });

    it('rejects invalid Email', () => {
      const r = validate('forgotPassword', { Email: 'invalid' });
      expect(r.valid).toBe(false);
    });
  });

  describe('resetPassword', () => {
    it('accepts Token and NewPassword (min 6)', () => {
      const r = validate('resetPassword', { Token: 'abc123', NewPassword: 'newpass6' });
      expect(r.valid).toBe(true);
    });

    it('rejects NewPassword shorter than 6', () => {
      const r = validate('resetPassword', { Token: 't', NewPassword: '12345' });
      expect(r.valid).toBe(false);
    });
  });

  describe('changePassword', () => {
    it('accepts OldPassword and NewPassword (min 6)', () => {
      const r = validate('changePassword', { OldPassword: 'old', NewPassword: 'new6666' });
      expect(r.valid).toBe(true);
    });

    it('rejects NewPassword shorter than 6', () => {
      const r = validate('changePassword', { OldPassword: 'old', NewPassword: '12345' });
      expect(r.valid).toBe(false);
    });
  });

  describe('createSubscription', () => {
    it('accepts WardId and optional ThresholdProbability 0-1', () => {
      const r = validate('createSubscription', { WardId: 'BN_Q1', ThresholdProbability: 0.7 });
      expect(r.valid).toBe(true);
    });

    it('rejects missing WardId', () => {
      const r = validate('createSubscription', { ThresholdProbability: 0.5 });
      expect(r.valid).toBe(false);
    });

    it('rejects ThresholdProbability out of range', () => {
      const r = validate('createSubscription', { WardId: 'X', ThresholdProbability: 1.5 });
      expect(r.valid).toBe(false);
    });
  });

  describe('updateSubscription', () => {
    it('accepts ThresholdProbability and IsEnabled', () => {
      const r = validate('updateSubscription', { ThresholdProbability: 0.8, IsEnabled: true });
      expect(r.valid).toBe(true);
    });
  });

  describe('report', () => {
    it('accepts CameraId and IsRaining', () => {
      const r = validate('report', { CameraId: 'cam1', IsRaining: true, Note: null });
      expect(r.valid).toBe(true);
    });

    it('rejects empty CameraId', () => {
      const r = validate('report', { CameraId: '', IsRaining: false });
      expect(r.valid).toBe(false);
    });
  });

  describe('checkRoute', () => {
    it('accepts array of at least 2 points with Lat, Lng', () => {
      const r = validate('checkRoute', [
        { Lat: 10.77, Lng: 106.7 },
        { Lat: 10.78, Lng: 106.71 },
      ]);
      expect(r.valid).toBe(true);
    });

    it('rejects fewer than 2 points', () => {
      const r = validate('checkRoute', [{ Lat: 10.77, Lng: 106.7 }]);
      expect(r.valid).toBe(false);
    });
  });

  describe('createCamera', () => {
    it('accepts valid Id, Name, Latitude, Longitude, StreamUrl', () => {
      const r = validate('createCamera', {
        Id: 'CAM01',
        Name: 'Camera Test Name',
        Latitude: 10.78,
        Longitude: 106.7,
        StreamUrl: 'https://example.com/stream',
      });
      expect(r.valid).toBe(true);
    });

    it('rejects Id shorter than 3', () => {
      const r = validate('createCamera', {
        Id: 'ab',
        Name: 'Camera Name Here',
        Latitude: 10.78,
        Longitude: 106.7,
        StreamUrl: 'https://example.com/stream',
      });
      expect(r.valid).toBe(false);
    });

    it('rejects Latitude out of range', () => {
      const r = validate('createCamera', {
        Id: 'CAM01',
        Name: 'Camera Name',
        Latitude: 9,
        Longitude: 106.7,
        StreamUrl: 'https://example.com/stream',
      });
      expect(r.valid).toBe(false);
    });
  });

  describe('updateCamera', () => {
    it('accepts Name, Latitude, Longitude', () => {
      const r = validate('updateCamera', {
        Name: 'Updated Camera Name',
        Latitude: 10.8,
        Longitude: 106.69,
      });
      expect(r.valid).toBe(true);
    });
  });
});
