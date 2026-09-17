import { Injectable, inject } from '@angular/core';
import { Observable, from, map } from 'rxjs';

import { SupabaseClientService } from '@core/supabase/supabase-client.service';

/** Публичный бакет Supabase Storage — создаётся вручную, см. docs/database/schema.md. */
const BUCKET = 'animal-photos';

/**
 * Загрузка фото животных в Supabase Storage. Отдельный класс от AnimalsRepository
 * (а не метод в нём), потому что работает не с таблицей `animals`, а со Storage API —
 * это разные ресурсы Supabase с разными правами доступа (RLS на `storage.objects`).
 */
@Injectable({ providedIn: 'root' })
export class AnimalPhotosStorage {
  private readonly supabaseClientService = inject(SupabaseClientService);

  /** Загружает файл и возвращает его публичный URL (бакет публичный на чтение). */
  upload(file: File): Observable<string> {
    const path = `${crypto.randomUUID()}-${file.name}`;
    const storage = this.supabaseClientService.client.storage.from(BUCKET);

    return from(storage.upload(path, file)).pipe(
      map(({ error }) => {
        if (error) {
          throw error;
        }
        return storage.getPublicUrl(path).data.publicUrl;
      })
    );
  }
}
