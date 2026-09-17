import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Subject, catchError, map, of, startWith, switchMap } from 'rxjs';

import { AnimalsFacade } from '@contexts/animals/application/animals.facade';
import { Animal, AnimalGender, AnimalStatus } from '@contexts/animals/domain/animal.model';
import { ButtonComponent } from '@shared/ui/button';
import { CheckboxComponent } from '@shared/ui/checkbox';
import { FileUploadComponent } from '@shared/ui/file-upload';
import { InputComponent } from '@shared/ui/input';
import { RadioComponent } from '@shared/ui/radio';
import { SectionComponent } from '@shared/ui/section';

type SubmitState = { readonly status: 'pending' | 'success' | 'error' };
type PhotoUploadState = { readonly status: 'idle' | 'uploading' | 'success' | 'error'; readonly url: string };

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
 * Добавление животного (docs/scheme/admin-panel.md). Пишет реальную строку в таблицу
 * `animals` через AnimalsFacade.create() — доступно только куратору (RLS insert-политика,
 * docs/database/schema.md), маршрут защищён authGuard.
 *
 * Фото загружается в Supabase Storage сразу при выборе файла (не при отправке формы) —
 * так проще: пока идёт загрузка, кнопка отправки просто ждёт готового URL, а не нужно
 * тащить File через весь submit-поток. Бакет `animal-photos` и его RLS-политики созданы
 * вручную в Supabase (см. docs/database/schema.md, куда я не могу писать сам).
 */
@Component({
  selector: 'app-admin-animal-create-page',
  standalone: true,
  imports: [ButtonComponent, CheckboxComponent, FileUploadComponent, InputComponent, RadioComponent, SectionComponent],
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

  protected readonly canSubmit = computed(() => {
    const ageValue = parseAge(this.age());
    return (
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
        dewormed: this.dewormed()
      },
      photoUrl: this.photoUploadResult().url
    });
  }
}
