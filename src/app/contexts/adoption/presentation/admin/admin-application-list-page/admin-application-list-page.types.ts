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
