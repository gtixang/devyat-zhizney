import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

import { AnimalsFacade } from '@contexts/animals/application';
import { Animal } from '@contexts/animals/domain';
import { AnimalCardComponent } from '@contexts/animals/presentation/components/animal-card';
import { formatAnimalsCount, isUrgent } from '@contexts/animals/presentation';
import { ButtonComponent } from '@shared/ui/button';
import { CardComponent } from '@shared/ui/card';
import { SectionComponent } from '@shared/ui/section';

/** Тизер показывает первых 4 доступных животных — без ручной курации по id. */
const FEATURED_COUNT = 4;
/** "Истории успеха" — тоже до 4 штук, чтобы блок не занимал пол-страницы. */
const SUCCESS_STORIES_COUNT = 4;

/**
 * Главная страница (docs/scheme/main-page.txt). Композирует контент из нескольких
 * контекстов (hero, тизер каталога, помощь) — поэтому живёт в static-pages,
 * а не внутри одного контекста.
 *
 * Тизер использует ту же AnimalsFacade.loadAvailable(), что и каталог (/animals) —
 * раньше здесь был отдельный локальный mock-набор с захардкоженными id, из-за чего
 * на главной могло показываться животное, которое в реальной базе уже пристроено
 * (mock не знал о реальном статусе) — см. обсуждение в чате.
 *
 * Блок "Срочно нужен временный дом" и "Истории успеха" — по итогам разбора того,
 * что реально важно для этой конкретной группы (нет здания-приюта, держится на
 * волонтёрах) и что повышает доверие у посетителей (см. обсуждение в чате):
 * - urgentCount — сколько сейчас животных со статусом needs_placement (ещё не под
 *   присмотром волонтёра) среди уже загруженных доступных животных, без отдельного
 *   запроса.
 * - successStories — отдельный запрос loadAll() (не loadAvailable(), который как
 *   раз ИСКЛЮЧАЕТ пристроенных), отфильтрованный на статус 'adopted'.
 *
 * "Пожертвовать" открывает модалку-заглушку вместо перехода на /help — реальных
 * платёжных реквизитов/интеграции пока нет (см. обсуждение в чате про ЮKassa),
 * поэтому явно показываем "скоро", а не ведём на страницу без действия по теме.
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

  protected readonly urgentCount = computed(() => this.availableAnimals().filter((animal) => isUrgent(animal.status)).length);
  protected readonly urgentCountLabel = computed(() => formatAnimalsCount(this.urgentCount()));

  private readonly allAnimals = toSignal(this.animalsFacade.loadAll().pipe(catchError(() => of([] as Animal[]))), {
    initialValue: [] as Animal[]
  });

  protected readonly successStories = computed(() =>
    this.allAnimals()
      .filter((animal) => animal.status === 'adopted')
      .slice(0, SUCCESS_STORIES_COUNT)
  );

  protected readonly isDonateModalOpen = signal(false);

  constructor() {
    // Пока открыта модалка — страница под ней не должна прокручиваться (тот же приём,
    // что и в photo-gallery для полноэкранного просмотра).
    effect(() => {
      document.body.style.overflow = this.isDonateModalOpen() ? 'hidden' : '';
    });

    inject(DestroyRef).onDestroy(() => {
      document.body.style.overflow = '';
    });
  }

  protected openDonateModal(): void {
    this.isDonateModalOpen.set(true);
  }

  protected closeDonateModal(): void {
    this.isDonateModalOpen.set(false);
  }

  protected onDonateBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeDonateModal();
    }
  }

  @HostListener('window:keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if (this.isDonateModalOpen() && event.key === 'Escape') {
      this.closeDonateModal();
    }
  }
}
