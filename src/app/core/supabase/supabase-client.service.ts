import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { environment } from '@environments/environment';

/**
 * Единая точка доступа к Supabase client для всего приложения.
 * Используется только слоем infrastructure (repositories) каждого контекста —
 * компоненты и application-слой не обращаются к Supabase напрямую (docs/specs/ts.md).
 *
 * Клиент создаётся лениво, при первом обращении к `client`, а не в конструкторе сервиса.
 * Иначе простое внедрение (inject(SupabaseClientService)) — например, транзитивно через
 * AnimalsRepository на странице с mock-данными, где Supabase не используется вовсе —
 * уже вызывало бы createClient() и падало с "supabaseUrl is required" при пустом environment.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseClientService {
  private cachedClient: SupabaseClient | undefined;

  get client(): SupabaseClient {
    if (!this.cachedClient) {
      this.cachedClient = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
    }
    return this.cachedClient;
  }
}
