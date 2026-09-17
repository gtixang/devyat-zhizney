import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { environment } from '@environments/environment';

/**
 * Часть посетителей открывает сайт из встроенного браузера ВКонтакте/Telegram
 * (у приюта основная аудитория именно там) или из режима приватного просмотра —
 * в таких окружениях обращение к `window.localStorage` может бросить исключение
 * ещё до первого запроса к Supabase (а не просто молча не сохранить сессию).
 * По умолчанию supabase-js использует localStorage для хранения сессии куратора
 * между визитами — здесь та же смена storage, а не отключение персистентности.
 */
function createSafeAuthStorage(): { getItem: (key: string) => string | null; setItem: (key: string, value: string) => void; removeItem: (key: string) => void } {
  try {
    const probeKey = '__supabase_storage_probe__';
    window.localStorage.setItem(probeKey, '1');
    window.localStorage.removeItem(probeKey);
    return window.localStorage;
  } catch {
    const memory = new Map<string, string>();
    return {
      getItem: (key) => memory.get(key) ?? null,
      setItem: (key, value) => memory.set(key, value),
      removeItem: (key) => {
        memory.delete(key);
      }
    };
  }
}

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
      this.cachedClient = createClient(environment.supabaseUrl, environment.supabaseAnonKey, {
        auth: { storage: createSafeAuthStorage() }
      });
    }
    return this.cachedClient;
  }
}
