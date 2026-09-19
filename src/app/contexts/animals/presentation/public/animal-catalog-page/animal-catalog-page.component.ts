import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';

import { SectionComponent } from '@shared/ui/section';
import { TabItem, TabsComponent } from '@shared/ui/tabs';
import { CheckboxComponent } from '@shared/ui/checkbox';
import { AnimalsFacade } from '@contexts/animals/application';
import { Animal, AnimalGender } from '@contexts/animals/domain';
import { AnimalCardComponent } from '@contexts/animals/presentation/components/animal-card';
import { formatAnimalsCount } from '@contexts/animals/presentation';
import { AGE_BUCKETS, AgeBucketId } from './animal-catalog-page.age-buckets';

const ALL_SPECIES_ID = 'all';

/**
 * Каталог животных (docs/scheme/main-page.txt, раздел "Ищет семью").
 *
 * Данные — реальная таблица `animals` в Supabase (docs/database/schema.md) через
 * AnimalsFacade.loadAvailable() — без животных со статусом "Пристроен" (они не
 * пропадают из базы, просто не показываются посетителям сайта). При ошибке загрузки
 * (например, сеть недоступна) показывается отдельное сообщение `loadFailed` —
 * не то же самое, что "по фильтрам ничего не нашлось", иначе реальный сбой загрузки
 * неотличим от честно пустого каталога (так уже путал реальных посетителей на мобильных).
 *
 * Три независимых фильтра: вид (эксклюзивный выбор — табы, единственный критерий,
 * подтверждённый docs/scheme иконками 🐕/🐈), возраст и пол (оба — множественный
 * выбор чекбоксами, уточняющие и необязательные). Поле `status` целиком (кроме
 * фильтрации пристроенных выше) — учётная метка куратора из admin-panel.txt, а не
 * критерий отбора для посетителя сайта, поэтому фильтром по нему не сделано.
 */
@Component({
  selector: 'app-animal-catalog-page',
  standalone: true,
  imports: [SectionComponent, TabsComponent, CheckboxComponent, AnimalCardComponent],
  templateUrl: './animal-catalog-page.component.html',
  styleUrl: './animal-catalog-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnimalCatalogPageComponent {
  private readonly animalsFacade = inject(AnimalsFacade);

  protected readonly ageBuckets = AGE_BUCKETS;

  private readonly loadResult = toSignal(
    this.animalsFacade.loadAvailable().pipe(
      map((animals) => ({ animals, failed: false })),
      catchError(() => of({ animals: [] as Animal[], failed: true }))
    ),
    { initialValue: { animals: [] as Animal[], failed: false } }
  );
  private readonly animals = computed(() => this.loadResult().animals);
  protected readonly loadFailed = computed(() => this.loadResult().failed);
  private readonly selectedSpeciesId = signal<string>(ALL_SPECIES_ID);
  private readonly selectedAgeBuckets = signal<ReadonlySet<AgeBucketId>>(new Set());
  private readonly selectedGenders = signal<ReadonlySet<AnimalGender>>(new Set());

  protected readonly speciesFilters = computed<readonly TabItem[]>(() => {
    const uniqueSpecies = Array.from(new Set(this.animals().map((animal) => animal.species)));
    return [{ id: ALL_SPECIES_ID, label: 'Все' }, ...uniqueSpecies.map((species) => ({ id: species, label: species }))];
  });

  protected readonly filteredAnimals = computed(() => {
    const speciesId = this.selectedSpeciesId();
    const ageBucketIds = this.selectedAgeBuckets();
    const genders = this.selectedGenders();

    return this.animals().filter((animal) => {
      if (speciesId !== ALL_SPECIES_ID && animal.species !== speciesId) {
        return false;
      }
      if (ageBucketIds.size > 0 && !AGE_BUCKETS.some((bucket) => ageBucketIds.has(bucket.id) && bucket.matches(animal.age))) {
        return false;
      }
      if (genders.size > 0 && !genders.has(animal.gender)) {
        return false;
      }
      return true;
    });
  });

  protected readonly resultsCountLabel = computed(() => formatAnimalsCount(this.filteredAnimals().length));

  protected onSpeciesFilterChange(speciesId: string): void {
    this.selectedSpeciesId.set(speciesId);
  }

  protected isAgeBucketSelected(bucketId: AgeBucketId): boolean {
    return this.selectedAgeBuckets().has(bucketId);
  }

  protected onAgeBucketToggle(bucketId: AgeBucketId, checked: boolean): void {
    const next = new Set(this.selectedAgeBuckets());
    if (checked) {
      next.add(bucketId);
    } else {
      next.delete(bucketId);
    }
    this.selectedAgeBuckets.set(next);
  }

  protected isGenderSelected(gender: AnimalGender): boolean {
    return this.selectedGenders().has(gender);
  }

  protected onGenderToggle(gender: AnimalGender, checked: boolean): void {
    const next = new Set(this.selectedGenders());
    if (checked) {
      next.add(gender);
    } else {
      next.delete(gender);
    }
    this.selectedGenders.set(next);
  }
}
