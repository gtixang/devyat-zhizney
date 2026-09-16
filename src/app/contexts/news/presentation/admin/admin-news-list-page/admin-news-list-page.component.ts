import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SectionComponent } from '../../../../../shared/ui/section/section.component';

/**
 * Placeholder админ-раздела "Новости" (docs/scheme/admin-panel.txt).
 */
@Component({
  selector: 'app-admin-news-list-page',
  standalone: true,
  imports: [SectionComponent],
  templateUrl: './admin-news-list-page.component.html',
  styleUrl: './admin-news-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminNewsListPageComponent {}
