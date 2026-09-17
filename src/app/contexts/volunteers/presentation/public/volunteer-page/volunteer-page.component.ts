import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SectionComponent } from '@shared/ui/section';

/**
 * Placeholder публичной страницы "Волонтёрам" (docs/scheme/main-page.txt, пункт навигации).
 * Домен "Волонтёры" пока не описан на уровне полей ни в одной схеме — модель появится
 * вместе со схемой БД.
 */
@Component({
  selector: 'app-volunteer-page',
  standalone: true,
  imports: [SectionComponent],
  templateUrl: './volunteer-page.component.html',
  styleUrl: './volunteer-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VolunteerPageComponent {}
