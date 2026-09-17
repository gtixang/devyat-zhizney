import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

import { SectionComponent } from '@shared/ui/section';
import { TabItem, TabsComponent } from '@shared/ui/tabs';
import { AnimalsFacade } from '@contexts/animals/application/animals.facade';
import { Animal } from '@contexts/animals/domain/animal.model';
import { AnimalCardComponent } from '@contexts/animals/presentation/components/animal-card/animal-card.component';

const ALL_SPECIES_ID = 'all';

/**
 * Каталог животных (docs/scheme/main-page.txt, раздел "Ищет семью").
 *
 * Данные — реальная таблица `animals` в Supabase (docs/database/schema.md) через
 * AnimalsFacade.loadAll(). При ошибке загрузки каталог просто остаётся пустым
 * (переиспользуется тот же @empty-стейт сетки), без падения страницы.
 *
 * Фильтр — только по виду животного (species): это единственное поле Animal,
 * для которого docs/scheme даёт реальное подтверждение как пользовательской
 * категории (иконки 🐕/🐈 в main-page.txt). Поле `status` ("В приюте"/"На
 * передержке") — учётная метка куратора из admin-panel.txt, а не критерий
 * отбора для посетителя сайта, поэтому фильтром не сделано.
 */
@Component({
  selector: 'app-animal-catalog-page',
  standalone: true,
  imports: [SectionComponent, TabsComponent, AnimalCardComponent],
  templateUrl: './animal-catalog-page.component.html',
  styleUrl: './animal-catalog-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnimalCatalogPageComponent {
  private readonly animalsFacade = inject(AnimalsFacade);

  private readonly animals = toSignal(this.animalsFacade.loadAll().pipe(catchError(() => of([] as Animal[]))), {
    initialValue: [] as Animal[]
  });
  private readonly selectedSpeciesId = signal<string>(ALL_SPECIES_ID);

  protected readonly speciesFilters = computed<readonly TabItem[]>(() => {
    const uniqueSpecies = Array.from(new Set(this.animals().map((animal) => animal.species)));
    return [{ id: ALL_SPECIES_ID, label: 'Все' }, ...uniqueSpecies.map((species) => ({ id: species, label: species }))];
  });

  protected readonly filteredAnimals = computed(() => {
    const speciesId = this.selectedSpeciesId();
    if (speciesId === ALL_SPECIES_ID) {
      return this.animals();
    }
    return this.animals().filter((animal) => animal.species === speciesId);
  });

  protected readonly resultsCountLabel = computed(() => formatAnimalsCount(this.filteredAnimals().length));

  protected onSpeciesFilterChange(speciesId: string): void {
    this.selectedSpeciesId.set(speciesId);
  }
}

function formatAnimalsCount(count: number): string {
  const isSingular = count % 10 === 1 && count % 100 !== 11;
  return `${count} ${isSingular ? 'животное' : 'животных'}`;
}
