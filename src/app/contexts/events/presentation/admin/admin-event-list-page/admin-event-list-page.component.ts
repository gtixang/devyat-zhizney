import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SectionComponent } from '../../../../../shared/ui/section/section.component';

/**
 * Placeholder админ-раздела "События" (docs/scheme/admin-panel.txt).
 * Публичного маршрута для событий в схемах не описано.
 */
@Component({
  selector: 'app-admin-event-list-page',
  standalone: true,
  imports: [SectionComponent],
  templateUrl: './admin-event-list-page.component.html',
  styleUrl: './admin-event-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminEventListPageComponent {}
