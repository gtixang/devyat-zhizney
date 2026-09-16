import { Injectable, computed, inject, signal } from '@angular/core';
import type { User } from '@supabase/supabase-js';

import { SupabaseClientService } from '../supabase/supabase-client.service';

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
    this.initialSessionLoaded = this.supabase.auth.getSession().then(({ data }) => {
      this.currentUserSignal.set(data.session?.user ?? null);
    });

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.currentUserSignal.set(session?.user ?? null);
    });
  }

  async waitUntilReady(): Promise<void> {
    await this.initialSessionLoaded;
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
