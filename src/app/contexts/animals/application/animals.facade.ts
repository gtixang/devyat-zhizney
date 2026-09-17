import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { Animal } from '../domain/animal.model';
import { AnimalPhotosStorage } from '../infrastructure/animal-photos.storage';
import { AnimalsRepository } from '../infrastructure/animals.repository';
import { MOCK_ANIMALS } from './animals.mock-data';

/**
 * Use-case слой контекста "Животные": единственная точка входа для presentation-слоя.
 * Компоненты вызывают методы фасада и читают результат как сигнал (toSignal),
 * не обращаясь к репозиторию/Supabase напрямую.
 */
@Injectable({ providedIn: 'root' })
export class AnimalsFacade {
  private readonly repository = inject(AnimalsRepository);
  private readonly photosStorage = inject(AnimalPhotosStorage);

  loadAll(): Observable<Animal[]> {
    return this.repository.findAll();
  }

  loadById(id: string): Observable<Animal | null> {
    return this.repository.findById(id);
  }

  /**
   * `id` намеренно генерируется здесь, а не вводится куратором вручную: `animals.id` —
   * обычный текстовый первичный ключ без значения по умолчанию (docs/database/schema.md),
   * а придумывать человекочитаемый slug (как у исходных 4 mock-животных: luna, murka…) на
   * каждое новое животное — лишняя нагрузка на куратора и риск коллизий. Красивые URL
   * сохраняются только у изначальных seed-животных, для новых это осознанный компромисс.
   */
  create(input: Omit<Animal, 'id'>): Observable<Animal> {
    const animal: Animal = { ...input, id: crypto.randomUUID() };
    return this.repository.create(animal).pipe(map(() => animal));
  }

  /** Загружает фото в Supabase Storage и возвращает публичный URL (для photoUrl). */
  uploadPhoto(file: File): Observable<string> {
    return this.photosStorage.upload(file);
  }

  /**
   * Тизер на главной странице (docs/scheme/main-page.txt) всё ещё использует
   * этот локальный mock-набор, а не loadAll() — см. историю обсуждения в чате.
   */
  loadMockCatalog(): readonly Animal[] {
    return MOCK_ANIMALS;
  }
}
