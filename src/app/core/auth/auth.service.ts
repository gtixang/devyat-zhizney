import { Injectable, computed, inject, signal } from '@angular/core';
import type { User } from '@supabase/supabase-js';

import { SupabaseClientService } from '../supabase';

/** См. waitUntilReady() — не даём проверке сессии зависнуть навсегда на плохой сети. */
const SESSION_CHECK_TIMEOUT_MS = 8_000;

/**
 * Состояние аутентификации на базе Supabase Auth.
 *
 * На этом этапе различаются только "гость" и "авторизованный пользователь" —
 * система ролей (admin/куратор и т.д.) сознательно не вводится: она появится
 * вместе со схемой БД, где будут определены роли и права (см. CLAUDE.md, раздел AUTH).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseClientService).client;

  private readonly currentUserSignal = signal<User | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

  /**
   * Восстановление сессии из localStorage — асинхронное (`getSession()` — промис).
   * `authGuard` обязан дождаться его перед проверкой `isAuthenticated()`, иначе при
   * перезагрузке страницы guard видит ещё не восстановленное состояние "не авторизован"
   * и ошибочно перенаправляет на /login, хотя валидная сессия есть.
   */
  private readonly initialSessionLoaded: Promise<void>;

  constructor() {
    this.initialSessionLoaded = this.supabase.auth
      .getSession()
      .then(({ data }) => {
        this.currentUserSignal.set(data.session?.user ?? null);
      })
      .catch(() => {
        // Не удалось прочитать сессию (сеть, заблокированный localStorage и т.п.) —
        // считаем гостем, а не оставляем guard висеть на отклонённом промисе.
        this.currentUserSignal.set(null);
      });

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.currentUserSignal.set(session?.user ?? null);
    });
  }

  /**
   * `authGuard` дожидается этого перед проверкой isAuthenticated(). На плохой мобильной
   * сети сам запрос к Supabase может зависнуть без ответа (см. отчёт о зависшем входе
   * с телефона) — через SESSION_CHECK_TIMEOUT_MS перестаём ждать и пускаем дальше с тем,
   * что успело определиться (по умолчанию — гость, редирект на /login).
   */
  async waitUntilReady(): Promise<void> {
    await Promise.race([
      this.initialSessionLoaded,
      new Promise<void>((resolve) => setTimeout(resolve, SESSION_CHECK_TIMEOUT_MS))
    ]);
  }

  async signInWithPassword(email: string, password: string): Promise<void> {
    const { error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      throw error;
    }
  }
}
