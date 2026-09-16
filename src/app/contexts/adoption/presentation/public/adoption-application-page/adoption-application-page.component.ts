import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Subject, catchError, map, of, startWith, switchMap } from 'rxjs';

import { AdoptionFacade } from '../../../application/adoption.facade';
import { AdoptionApplication } from '../../../domain/adoption-application.model';
import { AnimalsFacade } from '../../../../animals/application/animals.facade';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { InputComponent } from '../../../../../shared/ui/input/input.component';
import { SectionComponent } from '../../../../../shared/ui/section/section.component';

type SubmitPayload = Omit<AdoptionApplication, 'id' | 'status' | 'createdAt'>;
type SubmitState = { readonly status: 'pending' | 'success' | 'error' };

/**
 * Анкета "Хочу познакомиться" (docs/scheme/adoption-application.md).
 *
 * Отправка пишет реальную строку в таблицу `adoption_applications` через
 * AdoptionFacade.submit() (docs/database/schema.md). Компонент не делает
 * ручных .subscribe() (docs/specs/ts.md): клик по кнопке публикует payload
 * в submitTrigger$, а результат каждой попытки читается как сигнал через
 * toSignal() — как и остальные асинхронные данные в проекте.
 */
@Component({
  selector: 'app-adoption-application-page',
  standalone: true,
  imports: [RouterLink, ButtonComponent, InputComponent, SectionComponent],
  templateUrl: './adoption-application-page.component.html',
  styleUrl: './adoption-application-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdoptionApplicationPageComponent {
  public readonly animalId = input<string>('');

  private readonly animalsFacade = inject(AnimalsFacade);
  private readonly adoptionFacade = inject(AdoptionFacade);

  protected readonly animal = toSignal(
    toObservable(this.animalId).pipe(switchMap((id) => this.animalsFacade.loadById(id).pipe(catchError(() => of(null)))))
  );

  protected readonly applicantName = signal('');
  protected readonly phone = signal('');
  protected readonly telegram = signal('');
  protected readonly city = signal('');
  protected readonly hasOtherAnimals = signal<boolean | null>(null);
  protected readonly hasChildren = signal<boolean | null>(null);
  protected readonly aboutApplicant = signal('');

  protected readonly canSubmit = computed(
    () =>
      this.applicantName().trim().length > 0 &&
      this.phone().trim().length > 0 &&
      this.hasOtherAnimals() !== null &&
      this.hasChildren() !== null
  );

  private readonly submitTrigger = new Subject<SubmitPayload>();
  private readonly submitResult = toSignal(
    this.submitTrigger.pipe(
      switchMap((payload) =>
        this.adoptionFacade.submit(payload).pipe(
          map((): SubmitState => ({ status: 'success' })),
          catchError(() => of<SubmitState>({ status: 'error' })),
          startWith<SubmitState>({ status: 'pending' })
        )
      )
    )
  );

  protected readonly isSubmitting = computed(() => this.submitResult()?.status === 'pending');
  protected readonly isSubmitted = computed(() => this.submitResult()?.status === 'success');
  protected readonly hasSubmitError = computed(() => this.submitResult()?.status === 'error');

  protected onHasOtherAnimalsChange(value: boolean): void {
    this.hasOtherAnimals.set(value);
  }

  protected onHasChildrenChange(value: boolean): void {
    this.hasChildren.set(value);
  }

  protected onSubmit(): void {
    const name = this.applicantName().trim();
    const phoneValue = this.phone().trim();
    const otherAnimals = this.hasOtherAnimals();
    const children = this.hasChildren();

    if (!name || !phoneValue || otherAnimals === null || children === null) {
      return;
    }

    this.submitTrigger.next({
      animalId: this.animalId(),
      applicantName: name,
      phone: phoneValue,
      telegram: this.telegram().trim(),
      city: this.city().trim(),
      hasOtherAnimals: otherAnimals,
      hasChildren: children,
      aboutApplicant: this.aboutApplicant().trim()
    });
  }
}
