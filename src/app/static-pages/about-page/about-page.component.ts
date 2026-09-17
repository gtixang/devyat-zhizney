import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SectionComponent } from '@shared/ui/section/section.component';

/**
 * Placeholder страницы "О нас" (пункт навигации в docs/scheme/main-page.txt).
 * Чисто статический контент — не бизнес-домен, поэтому без DDD-слоёв.
 */
@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [SectionComponent],
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutPageComponent {}
