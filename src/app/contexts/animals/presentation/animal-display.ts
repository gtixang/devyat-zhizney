import { AnimalGender, AnimalHealth } from '@contexts/animals/domain';

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
