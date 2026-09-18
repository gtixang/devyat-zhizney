import { AdoptionApplication, AdoptionApplicationStatus } from '@contexts/adoption/domain';
import { BadgeTone } from '@shared/ui/badge';

export const STATUS_LABEL: Record<AdoptionApplicationStatus, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  approved: 'Одобрена'
};

export const STATUS_TONE: Record<AdoptionApplicationStatus, BadgeTone> = {
  new: 'accent',
  in_progress: 'primary',
  approved: 'neutral'
};

export interface ApplicationRow {
  readonly application: AdoptionApplication;
  readonly animalName: string;
}

/** Заявки продвигаются по статусам только вперёд — откат назад в этой версии не нужен. */
export const NEXT_STATUS: Record<AdoptionApplicationStatus, AdoptionApplicationStatus | null> = {
  new: 'in_progress',
  in_progress: 'approved',
  approved: null
};

export const NEXT_STATUS_ACTION_LABEL: Record<AdoptionApplicationStatus, string> = {
  new: 'Взять в работу',
  in_progress: 'Одобрить',
  approved: ''
};

export type StatusChangeState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'pending'; readonly applicationId: string }
  | { readonly kind: 'error'; readonly applicationId: string };
