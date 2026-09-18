import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Observable, Subject, catchError, map, of, startWith, switchMap } from 'rxjs';

import { AnimalsFacade } from '@contexts/animals/application';
import { Animal, AnimalGender, AnimalStatus } from '@contexts/animals/domain';
import { ButtonComponent } from '@shared/ui/button';
import { CheckboxComponent } from '@shared/ui/checkbox';
import { FileUploadComponent } from '@shared/ui/file-upload';
import { InputComponent } from '@shared/ui/input';
import { RadioComponent } from '@shared/ui/radio';
import { SectionComponent } from '@shared/ui/section';
import { PhotoUploadState, STATUS_OPTIONS, SubmitState } from './admin-animal-form-page.types';

/**
 * Возраст хранится в БД как целое число лет (`animals.age integer`), поэтому здесь
 * НЕ принимаются дробные значения (2.5 и т.п.) — только целая строка цифр.
 * Поле специально сделано текстовым (не type="number"): нативный number-инпут в
 * ру-раскладке молча стирает ввод при нажатии запятой, из-за чего поле выглядит
 * пустым и форма никогда не становится валидной.
 */
function parseAge(raw: string): number {
  const trimmed = raw.trim();
  return /^\d+$/.test(trimmed) ? Number.parseInt(trimmed, 10) : NaN;
}

/**
 * Добавление и редактирование животного одной формой (docs/scheme/admin-panel.md).
 * Режим определяется наличием route-параметра `id` (`withComponentInputBinding()`,
 * app.config.ts): `/admin/animals/new` — создание, `/admin/animals/:id/edit` —
 * редактирование. Один компонент вместо двух, потому что поля и вся валидация
 * идентичны — отличается только то, что в edit-режиме форма сперва подгружает
 * существующее животное и вызывает AnimalsFacade.update() вместо create().
 *
 * Фото загружается в Supabase Storage сразу при выборе файла (не при отправке формы) —
 * так проще: пока идёт загрузка, кнопка отправки просто ждёт готового URL, а не нужно
 * тащить File через весь submit-поток. Бакет `animal-photos` и его RLS-политики созданы
 * вручную в Supabase (см. docs/database/schema.md, куда я не могу писать сам). В edit-режиме,
 * пока куратор не выбрал новый файл, используется уже сохранённое первое фото животного.
 *
 * Форма пока управляет только ОДНИМ фото (загружает/заменяет), хотя домен уже поддерживает
 * галерею (Animal.photoUrls) — сохраняется как массив из одного элемента (или пустой).
 * Полноценная загрузка нескольких фото — отдельная задача на будущее.
 */
@Component({
  selector: 'app-admin-animal-form-page',
  standalone: true,
  imports: [ButtonComponent, CheckboxComponent, FileUploadComponent, InputComponent, RadioComponent, SectionComponent],
  templateUrl: './admin-animal-form-page.component.html',
  styleUrl: './admin-animal-form-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminAnimalFormPageComponent {
  private readonly animalsFacade = inject(AnimalsFacade);
  private readonly router = inject(Router);

  protected readonly statusOptions = STATUS_OPTIONS;

  public readonly id = input<string | undefined>(undefined);

  protected readonly isEditMode = computed(() => this.id() !== undefined);

  private readonly existingAnimal = toSignal(
    toObservable(this.id).pipe(
      switchMap((id) => (id ? this.animalsFacade.loadById(id).pipe(catchError(() => of(null))) : of(null)))
    )
  );

  protected readonly isLoadingExisting = computed(() => this.isEditMode() && this.existingAnimal() === undefined);
  protected readonly notFound = computed(() => this.isEditMode() && this.existingAnimal() === null);

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
  protected readonly needsTreatment = signal(false);
  protected readonly specialNeeds = signal(false);
  protected readonly existingPhotoUrl = signal('');

  protected readonly ageError = computed(() => {
    const raw = this.age().trim();
    if (raw.length === 0) {
      return '';
    }
    return Number.isFinite(parseAge(raw)) ? '' : 'Введите целое число лет, например 2';
  });

  private readonly photoSelected = new Subject<File | null>();
  private readonly photoUploadResult = toSignal(
    this.photoSelected.pipe(
      switchMap((file) => {
        if (!file) {
          return of<PhotoUploadState>({ status: 'idle', url: '' });
        }
        return this.animalsFacade.uploadPhoto(file).pipe(
          map((url): PhotoUploadState => ({ status: 'success', url })),
          catchError(() => of<PhotoUploadState>({ status: 'error', url: '' })),
          startWith<PhotoUploadState>({ status: 'uploading', url: '' })
        );
      })
    ),
    { initialValue: { status: 'idle', url: '' } as PhotoUploadState }
  );

  protected readonly isUploadingPhoto = computed(() => this.photoUploadResult().status === 'uploading');
  protected readonly hasPhotoUploadError = computed(() => this.photoUploadResult().status === 'error');
  protected readonly hasNewPhoto = computed(() => this.photoUploadResult().url.length > 0);
  /** Новое загруженное фото приоритетнее старого — иначе (в edit-режиме) остаётся прежнее. */
  protected readonly photoUrl = computed(() => this.photoUploadResult().url || this.existingPhotoUrl());

  protected readonly canSubmit = computed(() => {
    const ageValue = parseAge(this.age());
    return (
      !this.isLoadingExisting() &&
      !this.notFound() &&
      this.name().trim().length > 0 &&
      this.species().trim().length > 0 &&
      this.age().trim().length > 0 &&
      Number.isFinite(ageValue) &&
      ageValue >= 0 &&
      !this.isUploadingPhoto()
    );
  });

  private readonly submitTrigger = new Subject<Omit<Animal, 'id'>>();
  private readonly submitResult = toSignal(
    this.submitTrigger.pipe(
      switchMap((payload) => {
        const existingId = this.id();
        const save$: Observable<void> = existingId
          ? this.animalsFacade.update({ ...payload, id: existingId })
          : this.animalsFacade.create(payload).pipe(map(() => undefined));
        return save$.pipe(
          map((): SubmitState => ({ status: 'success' })),
          catchError(() => of<SubmitState>({ status: 'error' })),
          startWith<SubmitState>({ status: 'pending' })
        );
      })
    )
  );

  protected readonly isSubmitting = computed(() => this.submitResult()?.status === 'pending');
  protected readonly hasSubmitError = computed(() => this.submitResult()?.status === 'error');

  constructor() {
    // Подставляем поля формы из загруженного животного один раз, когда оно приедет —
    // дальше куратор свободно их редактирует, повторной перезаписи не происходит,
    // потому что existingAnimal() не меняется, пока не поменяется id() (см. switchMap выше).
    effect(() => {
      const animal = this.existingAnimal();
      if (!animal) {
        return;
      }
      this.name.set(animal.name);
      this.species.set(animal.species);
      this.gender.set(animal.gender);
      this.age.set(String(animal.age));
      this.status.set(animal.status);
      this.traitsInput.set(animal.traits.join(', '));
      this.about.set(animal.about);
      this.vaccinated.set(animal.health.vaccinated);
      this.sterilized.set(animal.health.sterilized);
      this.dewormed.set(animal.health.dewormed);
      this.needsTreatment.set(animal.health.needsTreatment);
      this.specialNeeds.set(animal.health.specialNeeds);
      this.existingPhotoUrl.set(animal.photoUrls[0] ?? '');
    });

    effect(() => {
      if (this.submitResult()?.status === 'success') {
        void this.router.navigate(['/admin/animals']);
      }
    });
  }

  protected onPhotoSelected(file: File | null): void {
    this.photoSelected.next(file);
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
      age: parseAge(this.age()),
      status: this.status(),
      traits,
      about: this.about().trim(),
      health: {
        vaccinated: this.vaccinated(),
        sterilized: this.sterilized(),
        dewormed: this.dewormed(),
        needsTreatment: this.needsTreatment(),
        specialNeeds: this.specialNeeds()
      },
      photoUrls: this.photoUrl() ? [this.photoUrl()] : [],
      // Резерв не редактируется в этой форме — им управляет статус заявки
      // (см. Animal.reserved), поэтому при сохранении просто сохраняем как было.
      reserved: this.existingAnimal()?.reserved ?? false
    });
  }
}
