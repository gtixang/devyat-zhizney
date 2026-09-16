/**
 * Домен "Животные". Поля строго ограничены тем, что подтверждено схемами:
 * docs/scheme/main-page.txt, docs/scheme/pet-card.txt, docs/scheme/admin-panel.txt.
 * Более широкий набор статусов и полей уточняется при проектировании БД Supabase.
 */

export type AnimalGender = 'male' | 'female';

/**
 * Где сейчас находится животное. Ровно два значения подтверждены таблицей
 * "ПОСЛЕДНИЕ ЖИВОТНЫЕ" в docs/scheme/admin-panel.txt ("В приюте" / "На передержке").
 */
export type AnimalStatus = 'in_shelter' | 'in_foster';

export interface AnimalHealth {
  readonly vaccinated: boolean;
  readonly sterilized: boolean;
  readonly dewormed: boolean;
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
  readonly photoUrl: string;
}
