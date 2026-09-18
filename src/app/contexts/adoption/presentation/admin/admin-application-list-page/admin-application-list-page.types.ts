import { AdoptionApplication, AdoptionApplicationStatus } from '@contexts/adoption/domain';
import { BadgeTone } from '@shared/ui/badge';

export const STATUS_LABEL: Record<AdoptionApplicationStatus, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  approved: 'Одобрена',
  rejected: 'Отклонена'
};

export const STATUS_TONE: Record<AdoptionApplicationStatus, BadgeTone> = {
  new: 'accent',
  in_progress: 'primary',
  approved: 'neutral',
  rejected: 'error'
};

export interface ApplicationRow {
  readonly application: AdoptionApplication;
  readonly animalName: string;
}

/**
 * Заявки продвигаются по статусам только вперёд — откат назад в этой версии не нужен.
 * `approved`/`rejected` — терминальные, дальше двигать некуда (`null`).
 */
export const NEXT_STATUS: Record<AdoptionApplicationStatus, AdoptionApplicationStatus | null> = {
  new: 'in_progress',
  in_progress: 'approved',
  approved: null,
  rejected: null
};

export const NEXT_STATUS_ACTION_LABEL: Record<AdoptionApplicationStatus, string> = {
  new: 'Взять в работу',
  in_progress: 'Одобрить',
  approved: '',
  rejected: ''
};

/**
 * Отклонить заявку можно, пока она не в терминальном статусе — это освобождает
 * зарезервированное животное обратно в каталог (Animal.reserved, см. компонент).
 */
export const CAN_REJECT: Record<AdoptionApplicationStatus, boolean> = {
  new: true,
  in_progress: true,
  approved: false,
  rejected: false
};

export type StatusChangeState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'pending'; readonly applicationId: string }
  | { readonly kind: 'error'; readonly applicationId: string };
