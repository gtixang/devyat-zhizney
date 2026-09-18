export type AgeBucketId = 'baby' | 'young' | 'adult' | 'senior';

export interface AgeBucket {
  readonly id: AgeBucketId;
  readonly label: string;
  readonly matches: (age: number) => boolean;
}

/**
 * Возраст фильтруется категориями жизненного этапа, а не диапазоном (input range):
 * на реальных сайтах усыновления (Petfinder и подобные) так и делают — люди ищут
 * "котёнка", а не "животное 0.7–1.3 года", тем более возраст в БД хранится целыми
 * годами (docs/database/schema.md). См. обсуждение в чате.
 */
export const AGE_BUCKETS: readonly AgeBucket[] = [
  { id: 'baby', label: 'Котёнок/щенок (до 1 года)', matches: (age) => age < 1 },
  { id: 'young', label: 'Молодой (1–3 года)', matches: (age) => age >= 1 && age < 3 },
  { id: 'adult', label: 'Взрослый (3–7 лет)', matches: (age) => age >= 3 && age < 7 },
  { id: 'senior', label: 'Пожилой (7+ лет)', matches: (age) => age >= 7 }
];
