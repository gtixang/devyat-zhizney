import { ANIMAL_STATUS_LABELS, AnimalStatus } from '@contexts/animals/domain';

export type SubmitState = { readonly status: 'pending' | 'success' | 'error' };
export type PhotoUploadState = { readonly status: 'idle' | 'uploading' | 'success' | 'error'; readonly url: string };

/** Порядок важен — так радиокнопки статуса идут от самого срочного к финальному. */
export const STATUS_OPTIONS: readonly { readonly id: AnimalStatus; readonly label: string }[] = [
  { id: 'needs_placement', label: ANIMAL_STATUS_LABELS.needs_placement },
  { id: 'in_shelter', label: ANIMAL_STATUS_LABELS.in_shelter },
  { id: 'in_foster', label: ANIMAL_STATUS_LABELS.in_foster },
  { id: 'adopted', label: ANIMAL_STATUS_LABELS.adopted }
];
