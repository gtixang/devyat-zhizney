import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SectionComponent } from '../../shared/ui/section/section.component';

/**
 * Placeholder дашборда куратора (docs/scheme/admin-panel.txt): агрегирует данные
 * нескольких контекстов (животные/заявки/волонтёры/передержки) — поэтому живёт
 * в static-pages, а не внутри одного контекста.
 */
@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [SectionComponent],
  templateUrl: './admin-dashboard-page.component.html',
  styleUrl: './admin-dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardPageComponent {}
