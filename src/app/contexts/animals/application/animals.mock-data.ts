import { Animal } from '../domain/animal.model';

/**
 * Локальный mock-набор для этапа "Каталог животных" (Supabase на этом этапе не подключается).
 *
 * `photoUrl` намеренно пустой: реальных фотографий животных в проекте нет —
 * AnimalCardComponent показывает аккуратный placeholder вместо фото (см. animal-card.component.html).
 * Имена Луна/Мурка/Бруно/Снежок и черты характера/health Луны — взяты дословно из
 * docs/scheme/main-page.txt и docs/scheme/pet-card.txt, остальные животные добавлены
 * для проверки сетки и фильтра по видам.
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
    photoUrl: ''
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
    photoUrl: ''
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
    photoUrl: ''
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
    photoUrl: ''
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
