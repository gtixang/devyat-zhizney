import { Animal } from '../domain/animal.model';

/**
 * Локальный mock-набор для главной страницы (тизер "Ищет семью") — Supabase здесь
 * не используется, см. историю обсуждения в чате.
 *
 * У первых 4 животных (luna/murka/bruno/snezhok, они же показаны на главной и
 * реально существуют в Supabase — docs/database/schema.md) `photoUrl` указывает
 * на свободно лицензированные фото с Unsplash (Unsplash License — можно использовать
 * без атрибуции), подставлены только для демонстрации живого вида каталога.
 * Это НЕ фото реальных животных приюта «Девять жизней» — как только появятся
 * настоящие фото, их нужно будет заменить (см. обсуждение про Supabase Storage).
 * У остальных 4 (baron/ryzhik/ten/dymka, не используются ни на одной текущей
 * странице) `photoUrl` оставлен пустым — так же, как раньше показывает placeholder.
 *
 * Имена Луна/Мурка/Бруно/Снежок и черты характера/health Луны — взяты дословно из
 * docs/scheme/main-page.txt и docs/scheme/pet-card.txt.
 */
export const MOCK_ANIMALS: readonly Animal[] = [
  {
    id: 'luna',
    name: 'Луна',
    species: 'Собака',
    gender: 'female',
    age: 3,
    status: 'in_shelter',
    traits: ['Спокойная', 'Дружелюбная', 'Приучена к выгулу'],
    about: 'Луна очень ласковая и любит людей, легко находит общий язык с детьми и другими животными.',
    health: { vaccinated: true, sterilized: true, dewormed: true },
    photoUrl: 'https://images.unsplash.com/photo-1668036268050-ca69ef2f0ca0?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 'murka',
    name: 'Мурка',
    species: 'Кошка',
    gender: 'female',
    age: 1,
    status: 'in_shelter',
    traits: ['Ласковая', 'Любит спать на руках'],
    about: 'Мурка обожает нежиться на солнышке и совсем не боится других животных.',
    health: { vaccinated: true, sterilized: false, dewormed: true },
    photoUrl: 'https://images.unsplash.com/photo-1668194273694-89a5046f0181?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 'bruno',
    name: 'Бруно',
    species: 'Собака',
    gender: 'male',
    age: 2,
    status: 'in_foster',
    traits: ['Активный', 'Любит детей'],
    about: 'Бруно ищет активную семью, готов на долгие прогулки и игры.',
    health: { vaccinated: true, sterilized: true, dewormed: true },
    photoUrl: 'https://images.unsplash.com/photo-1559861985-8c8c4c0fcbb4?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 'snezhok',
    name: 'Снежок',
    species: 'Кошка',
    gender: 'male',
    age: 4,
    status: 'in_shelter',
    traits: ['Спокойный', 'Аккуратный'],
    about: 'Снежок — рассудительный кот, который ценит тишину и уют.',
    health: { vaccinated: true, sterilized: true, dewormed: false },
    photoUrl: 'https://images.unsplash.com/photo-1653176070897-da3de9bbdc3c?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 'baron',
    name: 'Барон',
    species: 'Собака',
    gender: 'male',
    age: 5,
    status: 'in_shelter',
    traits: ['Охраняет территорию', 'Верный'],
    about: 'Барон — надёжный компаньон для опытного хозяина.',
    health: { vaccinated: true, sterilized: false, dewormed: true },
    photoUrl: ''
  },
  {
    id: 'ryzhik',
    name: 'Рыжик',
    species: 'Кошка',
    gender: 'male',
    age: 2,
    status: 'in_foster',
    traits: ['Игривый', 'Общительный'],
    about: 'Рыжик обожает игрушки и всегда рад новым знакомствам.',
    health: { vaccinated: false, sterilized: false, dewormed: true },
    photoUrl: ''
  },
  {
    id: 'ten',
    name: 'Тень',
    species: 'Собака',
    gender: 'female',
    age: 1,
    status: 'in_shelter',
    traits: ['Пугливая', 'Нуждается в терпении'],
    about: 'Тень постепенно раскрывается и учится доверять людям.',
    health: { vaccinated: true, sterilized: false, dewormed: false },
    photoUrl: ''
  },
  {
    id: 'dymka',
    name: 'Дымка',
    species: 'Кошка',
    gender: 'female',
    age: 6,
    status: 'in_foster',
    traits: ['Спокойная', 'Домоседка'],
    about: 'Дымка любит спокойную обстановку и станет отличным компаньоном.',
    health: { vaccinated: true, sterilized: true, dewormed: true },
    photoUrl: ''
  }
];
