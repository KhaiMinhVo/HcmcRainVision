/**
 * Alert subscriptions API: GET/POST/PUT/DELETE /api/subscriptions (requires auth)
 */
import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';
import type {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  AlertSubscriptionResponseDto,
} from '../types/api';

export async function getMySubscriptions(): Promise<AlertSubscriptionResponseDto[]> {
  const data = await apiGet<AlertSubscriptionResponseDto[]>('api/subscriptions');
  return Array.isArray(data) ? data : [];
}

export async function createSubscription(
  body: CreateSubscriptionDto
): Promise<AlertSubscriptionResponseDto> {
  return apiPost<AlertSubscriptionResponseDto>('api/subscriptions', body);
}

export async function updateSubscription(
  id: string,
  body: UpdateSubscriptionDto
): Promise<{ message: string }> {
  return apiPut<{ message: string }>(`api/subscriptions/${id}`, body);
}

export async function deleteSubscription(id: string): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`api/subscriptions/${id}`);
}
