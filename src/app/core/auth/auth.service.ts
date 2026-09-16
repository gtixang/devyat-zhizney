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

  constructor() {
    this.supabase.auth.getSession().then(({ data }) => {
      this.currentUserSignal.set(data.session?.user ?? null);
    });

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.currentUserSignal.set(session?.user ?? null);
    });
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
