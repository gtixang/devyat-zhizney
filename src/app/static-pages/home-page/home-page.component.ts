import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

import { AnimalsFacade } from '@contexts/animals/application';
import { Animal } from '@contexts/animals/domain';
import { AnimalCardComponent } from '@contexts/animals/presentation/components/animal-card';
import { ButtonComponent } from '@shared/ui/button';
import { CardComponent } from '@shared/ui/card';
import { SectionComponent } from '@shared/ui/section';

/** Тизер показывает первых 4 доступных животных — без ручной курации по id. */
const FEATURED_COUNT = 4;

/**
 * Главная страница (docs/scheme/main-page.txt). Композирует контент из нескольких
 * контекстов (hero, тизер каталога, помощь) — поэтому живёт в static-pages,
 * а не внутри одного контекста.
 *
 * Тизер использует ту же AnimalsFacade.loadAvailable(), что и каталог (/animals) —
 * раньше здесь был отдельный локальный mock-набор с захардкоженными id, из-за чего
 * на главной могло показываться животное, которое в реальной базе уже пристроено
 * (mock не знал о реальном статусе) — см. обсуждение в чате.
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

  private readonly availableAnimals = toSignal(
    this.animalsFacade.loadAvailable().pipe(catchError(() => of([] as Animal[]))),
    { initialValue: [] as Animal[] }
  );

  protected readonly totalAnimalsCount = computed(() => this.availableAnimals().length);

  protected readonly featuredAnimals = computed(() => this.availableAnimals().slice(0, FEATURED_COUNT));
}
