import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Subject, TimeoutError, catchError, from, map, of, startWith, switchMap, timeout } from 'rxjs';

import { AuthService } from '@core/auth';
import { ButtonComponent } from '@shared/ui/button';
import { InputComponent } from '@shared/ui/input';
import { SectionComponent } from '@shared/ui/section';

interface LoginCredentials {
  readonly email: string;
  readonly password: string;
}

type LoginState = { readonly status: 'pending' | 'success' | 'error' | 'timeout' };

/** Supabase-запросы не имеют встроенного таймаута — на плохой мобильной сети запрос
 * может зависнуть навсегда, а кнопка "Входим…" — так и не вернуться в исходное
 * состояние. Обрываем сами и показываем понятную ошибку вместо вечной загрузки. */
const SIGN_IN_TIMEOUT_MS = 15_000;

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
          timeout(SIGN_IN_TIMEOUT_MS),
          map((): LoginState => ({ status: 'success' })),
          catchError((error: unknown) =>
            of<LoginState>({ status: error instanceof TimeoutError ? 'timeout' : 'error' })
          ),
          startWith<LoginState>({ status: 'pending' })
        )
      )
    )
  );

  protected readonly isSubmitting = computed(() => this.loginResult()?.status === 'pending');
  protected readonly hasError = computed(() => this.loginResult()?.status === 'error');
  protected readonly hasTimedOut = computed(() => this.loginResult()?.status === 'timeout');

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
