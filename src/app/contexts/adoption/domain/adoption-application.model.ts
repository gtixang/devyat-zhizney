/**
 * Домен "Заявки на усыновление". Поля соответствуют форме анкеты
 * (docs/scheme/adoption-application.txt) и статусам из таблицы заявок
 * в админ-панели (docs/scheme/admin-panel.txt: NEW / IN PROGRESS / APPROVED).
 */

export type AdoptionApplicationStatus = 'new' | 'in_progress' | 'approved';

export interface AdoptionApplication {
  readonly id: string;
  readonly animalId: string;
  readonly applicantName: string;
  readonly phone: string;
  readonly telegram: string;
  readonly city: string;
  readonly hasOtherAnimals: boolean;
  readonly hasChildren: boolean;
  readonly aboutApplicant: string;
  readonly status: AdoptionApplicationStatus;
  readonly createdAt: string;
}
