/**
 * Домен "Животные". Поля строго ограничены тем, что подтверждено схемами:
 * docs/scheme/main-page.txt, docs/scheme/pet-card.txt, docs/scheme/admin-panel.txt,
 * плюс два расширения статуса/здоровья по итогам обсуждения с куратором в чате
 * (см. docs/database/schema.md, раздел "Миграция: расширенные статус и здоровье").
 */

export type AnimalGender = 'male' | 'female';

/**
 * Где сейчас находится животное и на какой оно стадии.
 * `needs_placement` — животное известно куратору, но ещё не в приюте и не на
 * передержке (например, живёт на улице, пока нет места) — самая срочная категория.
 * `adopted` — нашло дом; такие животные скрываются из публичного каталога
 * (AnimalsFacade.loadAvailable()), но остаются в базе для истории куратора.
 */
export type AnimalStatus = 'needs_placement' | 'in_shelter' | 'in_foster' | 'adopted';

export const ANIMAL_STATUS_LABELS: Record<AnimalStatus, string> = {
  needs_placement: 'Нужен приют',
  in_shelter: 'В приюте',
  in_foster: 'На передержке',
  adopted: 'Пристроен'
};

export interface AnimalHealth {
  readonly vaccinated: boolean;
  readonly sterilized: boolean;
  readonly dewormed: boolean;
  /** Требуется лечение — в отличие от трёх полей выше, `true` здесь означает
   *  тревогу, а не выполненную заботу, поэтому в UI показывается не чекбоксом
   *  в общем списке, а отдельным предупреждающим бейджем. */
  readonly needsTreatment: boolean;
  /** Особые потребности (хроническое заболевание, инвалидность и т.п.) — как и
   *  needsTreatment, это не "выполненный пункт заботы", а важное предупреждение. */
  readonly specialNeeds: boolean;
}

export interface Animal {
  readonly id: string;
  readonly name: string;
  /** Вид животного (в схемах встречаются только "Собака"/"Кошка", поле оставлено строкой,
   *  чтобы не фиксировать закрытый список раньше времени). */
  readonly species: string;
  readonly gender: AnimalGender;
  readonly age: number;
  readonly status: AnimalStatus;
  readonly traits: readonly string[];
  readonly about: string;
  readonly health: AnimalHealth;
  /** Галерея фото на странице животного (shared/ui/photo-gallery); может быть пустой —
   *  тогда показывается плейсхолдер. Первое фото — обложка в карточке каталога. */
  readonly photoUrls: readonly string[];
  /**
   * Скрыто из публичного каталога, потому что по нему сейчас обрабатывается заявка
   * на усыновление (кто-то другой мог бы претендовать на уже занятое животное) —
   * независимо от `status`, который описывает физическое размещение, а не это.
   * Куратор не выставляет это поле вручную: оно включается/выключается автоматически
   * при смене статуса заявки (см. AdminApplicationListPageComponent) — "В работе"
   * резервирует животное, "Отклонена" освобождает обратно, "Одобрена" оставляет как есть.
   */
  readonly reserved: boolean;
  /**
   * Куратор/волонтёр, у которого сейчас фактически находится животное — служебная
   * заметка для куратора (не адоптера), не привязана ни к какому домену "Волонтёры"
   * (его ещё нет), просто свободный текст. Может быть пустой строкой, если пока не
   * назначен. Не показывается на публичных страницах — см. animal-card.component.ts.
   */
  readonly curatorName: string;
}
