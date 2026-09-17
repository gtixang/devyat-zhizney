import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SectionComponent } from '@shared/ui/section/section.component';

/**
 * Placeholder публичной страницы "Новости" (docs/scheme/main-page.txt, docs/scheme/general-schema.txt).
 */
@Component({
  selector: 'app-news-list-page',
  standalone: true,
  imports: [SectionComponent],
  templateUrl: './news-list-page.component.html',
  styleUrl: './news-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsListPageComponent {}
