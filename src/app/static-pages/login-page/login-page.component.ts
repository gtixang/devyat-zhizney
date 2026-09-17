import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Subject, catchError, from, map, of, startWith, switchMap } from 'rxjs';

import { AuthService } from '@core/auth/auth.service';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { InputComponent } from '@shared/ui/input/input.component';
import { SectionComponent } from '@shared/ui/section/section.component';

interface LoginCredentials {
  readonly email: string;
  readonly password: string;
}

type LoginState = { readonly status: 'pending' | 'success' | 'error' };

/**
 * Вход куратора (Supabase Auth). Публичной регистрации нет и не будет —
 * аккаунты кураторов заводятся вручную в Supabase Dashboard (осознанное решение,
 * см. обсуждение в чате). Компонент не делает ручных .subscribe() (docs/specs/ts.md) —
 * так же, как форма анкеты усыновления.
 */
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ButtonComponent, InputComponent, SectionComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly email = signal('');
  protected readonly password = signal('');

  protected readonly canSubmit = computed(() => this.email().trim().length > 0 && this.password().length > 0);

  private readonly loginTrigger = new Subject<LoginCredentials>();
  private readonly loginResult = toSignal(
    this.loginTrigger.pipe(
      switchMap(({ email, password }) =>
        from(this.authService.signInWithPassword(email, password)).pipe(
          map((): LoginState => ({ status: 'success' })),
          catchError(() => of<LoginState>({ status: 'error' })),
          startWith<LoginState>({ status: 'pending' })
        )
      )
    )
  );

  protected readonly isSubmitting = computed(() => this.loginResult()?.status === 'pending');
  protected readonly hasError = computed(() => this.loginResult()?.status === 'error');

  constructor() {
    effect(() => {
      if (this.loginResult()?.status === 'success') {
        void this.router.navigate(['/admin']);
      }
    });
  }

  protected onSubmit(): void {
    const email = this.email().trim();
    const password = this.password();
    if (!email || !password) {
      return;
    }
    this.loginTrigger.next({ email, password });
  }
}
