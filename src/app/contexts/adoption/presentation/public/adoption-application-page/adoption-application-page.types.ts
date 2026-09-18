import { AdoptionApplication } from '@contexts/adoption/domain';

export type SubmitPayload = Omit<AdoptionApplication, 'id' | 'status' | 'createdAt'>;
export type SubmitState = { readonly status: 'pending' | 'success' | 'error' };
