import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';

import { AnimalsFacade } from '@contexts/animals/application';
import { BadgeComponent } from '@shared/ui/badge';
import { ButtonComponent } from '@shared/ui/button';
import { SectionComponent } from '@shared/ui/section';

interface HealthChecklistItem {
  readonly label: string;
  readonly done: boolean;
}

/**
 * Карточка животного (docs/scheme/pet-card.md). Данные — реальная таблица `animals`
 * в Supabase (docs/database/schema.md) через AnimalsFacade.loadById().
 *
 * `animal()` различает три состояния: `undefined` — идёт загрузка, `null` — животное
 * не найдено (или ошибка загрузки), `Animal` — данные получены.
 *
 * Имя животного нигде не подставляется в падежные формы ("о Луне", "забрать Луну") —
 * русское склонение произвольных имён нельзя корректно автоматизировать без отдельной
 * библиотеки, поэтому заголовки сформулированы без обращения к падежам.
 */
@Component({
  selector: 'app-animal-detail-page',
  standalone: true,
  imports: [RouterLink, BadgeComponent, ButtonComponent, SectionComponent],
  templateUrl: './animal-detail-page.component.html',
  styleUrl: './animal-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnimalDetailPageComponent {
  public readonly id = input<string>('');

  private readonly animalsFacade = inject(AnimalsFacade);

  protected readonly animal = toSignal(
    toObservable(this.id).pipe(switchMap((id) => this.animalsFacade.loadById(id).pipe(catchError(() => of(null)))))
  );

  protected readonly genderLabel = computed(() => (this.animal()?.gender === 'female' ? 'девочка' : 'мальчик'));

  protected readonly healthItems = computed<readonly HealthChecklistItem[]>(() => {
    const animal = this.animal();
    if (!animal) {
      return [];
    }
    return [
      { label: 'Привита', done: animal.health.vaccinated },
      { label: 'Стерилизована', done: animal.health.sterilized },
      { label: 'Обработана от паразитов', done: animal.health.dewormed }
    ];
  });
}
