import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Subject, catchError, map, of, startWith, switchMap } from 'rxjs';

import { AnimalsFacade } from '../../../application/animals.facade';
import { Animal, AnimalGender, AnimalStatus } from '../../../domain/animal.model';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { CheckboxComponent } from '../../../../../shared/ui/checkbox/checkbox.component';
import { InputComponent } from '../../../../../shared/ui/input/input.component';
import { RadioComponent } from '../../../../../shared/ui/radio/radio.component';
import { SectionComponent } from '../../../../../shared/ui/section/section.component';

type SubmitState = { readonly status: 'pending' | 'success' | 'error' };

/**
 * Добавление животного (docs/scheme/admin-panel.md). Пишет реальную строку в таблицу
 * `animals` через AnimalsFacade.create() — доступно только куратору (RLS insert-политика,
 * docs/database/schema.md), маршрут защищён authGuard.
 *
 * Фото не загружается на этом этапе (осознанное решение — см. обсуждение в чате):
 * FileUploadComponent умеет только локальный выбор+превью, реальная загрузка требует
 * отдельной настройки Supabase Storage. `photoUrl` сохраняется пустым, как и у остальных
 * животных — каталог уже умеет показывать плейсхолдер вместо фото.
 */
@Component({
  selector: 'app-admin-animal-create-page',
  standalone: true,
  imports: [ButtonComponent, CheckboxComponent, InputComponent, RadioComponent, SectionComponent],
  templateUrl: './admin-animal-create-page.component.html',
  styleUrl: './admin-animal-create-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminAnimalCreatePageComponent {
  private readonly animalsFacade = inject(AnimalsFacade);
  private readonly router = inject(Router);

  protected readonly name = signal('');
  protected readonly species = signal('');
  protected readonly gender = signal<AnimalGender>('female');
  protected readonly age = signal('');
  protected readonly status = signal<AnimalStatus>('in_shelter');
  protected readonly traitsInput = signal('');
  protected readonly about = signal('');
  protected readonly vaccinated = signal(false);
  protected readonly sterilized = signal(false);
  protected readonly dewormed = signal(false);

  protected readonly canSubmit = computed(() => {
    const ageValue = Number(this.age());
    return (
      this.name().trim().length > 0 &&
      this.species().trim().length > 0 &&
      this.age().trim().length > 0 &&
      Number.isFinite(ageValue) &&
      ageValue >= 0
    );
  });

  private readonly submitTrigger = new Subject<Omit<Animal, 'id'>>();
  private readonly submitResult = toSignal(
    this.submitTrigger.pipe(
      switchMap((payload) =>
        this.animalsFacade.create(payload).pipe(
          map((): SubmitState => ({ status: 'success' })),
          catchError(() => of<SubmitState>({ status: 'error' })),
          startWith<SubmitState>({ status: 'pending' })
        )
      )
    )
  );

  protected readonly isSubmitting = computed(() => this.submitResult()?.status === 'pending');
  protected readonly hasSubmitError = computed(() => this.submitResult()?.status === 'error');

  constructor() {
    effect(() => {
      if (this.submitResult()?.status === 'success') {
        void this.router.navigate(['/admin/animals']);
      }
    });
  }

  protected onGenderChange(value: string): void {
    this.gender.set(value as AnimalGender);
  }

  protected onStatusChange(value: string): void {
    this.status.set(value as AnimalStatus);
  }

  protected onSubmit(): void {
    if (!this.canSubmit()) {
      return;
    }

    const traits = this.traitsInput()
      .split(',')
      .map((trait) => trait.trim())
      .filter((trait) => trait.length > 0);

    this.submitTrigger.next({
      name: this.name().trim(),
      species: this.species().trim(),
      gender: this.gender(),
      age: Number(this.age()),
      status: this.status(),
      traits,
      about: this.about().trim(),
      health: {
        vaccinated: this.vaccinated(),
        sterilized: this.sterilized(),
        dewormed: this.dewormed()
      },
      photoUrl: ''
    });
  }
}
