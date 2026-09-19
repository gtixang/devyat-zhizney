import { AnimalGender, AnimalHealth, AnimalStatus } from '@contexts/animals/domain';

/**
 * "Срочно нужен дом" — единственный кусочек статуса, который всё же имеет смысл
 * показывать посетителю (не куратору): животное ещё не под присмотром волонтёра
 * (см. AnimalStatus в animal.model.ts). Сам статус целиком по-прежнему не
 * показывается — только этот один производный факт, полезный адоптеру, а не
 * админу. См. обсуждение в чате.
 */
export const URGENT_LABEL = 'Срочно нужен дом';

export function isUrgent(status: AnimalStatus): boolean {
  return status === 'needs_placement';
}

/**
 * Чистые функции форматирования животного для отображения — общие для публичной
 * страницы животного (animal-detail-page) и карточки животного в админке
 * (admin-animal-detail-page), чтобы не дублировать одну и ту же логику дважды.
 */

export interface HealthChecklistItem {
  readonly label: string;
  readonly done: boolean;
}

export function getGenderLabel(gender: AnimalGender): string {
  return gender === 'female' ? 'девочка' : 'мальчик';
}

/**
 * needsTreatment/specialNeeds — не "выполненный пункт заботы", как vaccinated/
 * sterilized/dewormed, а предупреждение, поэтому не входят в getHealthItems(),
 * а показываются отдельными бейджами (см. AnimalHealth в animal.model.ts).
 */
export function getHealthWarnings(health: AnimalHealth): readonly string[] {
  const warnings: string[] = [];
  if (health.needsTreatment) {
    warnings.push('Требуется лечение');
  }
  if (health.specialNeeds) {
    warnings.push('Особые потребности');
  }
  return warnings;
}

export function getHealthItems(health: AnimalHealth): readonly HealthChecklistItem[] {
  return [
    { label: 'Привита', done: health.vaccinated },
    { label: 'Стерилизована', done: health.sterilized },
    { label: 'Обработана от паразитов', done: health.dewormed }
  ];
}

/**
 * Раньше жила только в animal-catalog-page.component.ts — теперь нужна и главной
 * странице (счётчик срочных животных), вынесена сюда, чтобы не дублировать.
 */
export function formatAnimalsCount(count: number): string {
  const isSingular = count % 10 === 1 && count % 100 !== 11;
  return `${count} ${isSingular ? 'животное' : 'животных'}`;
}
