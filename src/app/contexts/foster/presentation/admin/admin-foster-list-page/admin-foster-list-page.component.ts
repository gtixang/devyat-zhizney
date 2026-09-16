import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SectionComponent } from '../../../../../shared/ui/section/section.component';

/**
 * Placeholder админ-раздела "Передержки" (docs/scheme/admin-panel.txt).
 * Публичного маршрута для передержек в схемах не описано (упоминается только
 * как один из пунктов на статической странице "Помочь").
 */
@Component({
  selector: 'app-admin-foster-list-page',
  standalone: true,
  imports: [SectionComponent],
  templateUrl: './admin-foster-list-page.component.html',
  styleUrl: './admin-foster-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminFosterListPageComponent {}
