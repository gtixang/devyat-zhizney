import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { AdoptionApplication } from '../domain/adoption-application.model';
import { AdoptionApplicationsRepository } from '../infrastructure/adoption-applications.repository';

/**
 * Use-case слой контекста "Заявки на усыновление".
 */
@Injectable({ providedIn: 'root' })
export class AdoptionFacade {
  private readonly repository = inject(AdoptionApplicationsRepository);

  loadAll(): Observable<AdoptionApplication[]> {
    return this.repository.findAll();
  }

  submit(application: Omit<AdoptionApplication, 'id' | 'status' | 'createdAt'>): Observable<void> {
    return this.repository.create(application);
  }
}
