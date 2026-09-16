import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SectionComponent } from '../../../../../shared/ui/section/section.component';

/**
 * Placeholder админ-раздела "Волонтёры" (docs/scheme/admin-panel.txt).
 */
@Component({
  selector: 'app-admin-volunteer-list-page',
  standalone: true,
  imports: [SectionComponent],
  templateUrl: './admin-volunteer-list-page.component.html',
  styleUrl: './admin-volunteer-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminVolunteerListPageComponent {}
