import { BadgeTone } from '@shared/ui/badge';
import { AnimalStatus } from '@contexts/animals/domain';

/**
 * Маппинг доменного статуса животного в тон бейджа — общий для карточки каталога,
 * страницы животного и списка в админке (раньше было продублировано в каждой из них).
 * Лежит в presentation, а не в domain: BadgeTone — тип shared/ui, а домен не должен
 * знать о конкретном UI-виджете (см. комментарий в badge.component.ts).
 */
export const ANIMAL_STATUS_TONE: Record<AnimalStatus, BadgeTone> = {
  needs_placement: 'warning',
  in_shelter: 'neutral',
  in_foster: 'primary',
  adopted: 'success'
};
