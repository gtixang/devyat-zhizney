import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AnimalsFacade } from '@contexts/animals/application/animals.facade';
import { AnimalCardComponent } from '@contexts/animals/presentation/components/animal-card/animal-card.component';
import { ButtonComponent } from '@shared/ui/button';
import { CardComponent } from '@shared/ui/card';
import { SectionComponent } from '@shared/ui/section';

/** Порядок и состав тизера повторяют docs/scheme/main-page.txt, раздел "ИЩЕТ СЕМЬЮ". */
const FEATURED_ANIMAL_IDS = ['bruno', 'murka', 'luna', 'snezhok'] as const;

/**
 * Главная страница (docs/scheme/main-page.txt). Композирует контент из нескольких
 * контекстов (hero, тизер каталога, помощь) — поэтому живёт в static-pages,
 * а не внутри одного контекста. Данные — тот же mock-набор, что и у /animals
 * (AnimalsFacade.loadMockCatalog()), второй набор mock-данных не создавался.
 */
@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, ButtonComponent, CardComponent, SectionComponent, AnimalCardComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePageComponent {
  private readonly animalsFacade = inject(AnimalsFacade);

  private readonly allAnimals = computed(() => this.animalsFacade.loadMockCatalog());

  protected readonly totalAnimalsCount = computed(() => this.allAnimals().length);

  protected readonly featuredAnimals = computed(() => {
    const all = this.allAnimals();
    return FEATURED_ANIMAL_IDS.map((id) => all.find((animal) => animal.id === id)).filter(
      (animal): animal is NonNullable<typeof animal> => animal != null
    );
  });
}
