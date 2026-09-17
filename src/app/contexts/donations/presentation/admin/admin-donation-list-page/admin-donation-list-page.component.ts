import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SectionComponent } from '@shared/ui/section/section.component';

/**
 * Placeholder админ-раздела "Донаты" (docs/scheme/admin-panel.txt).
 * Публичный призыв к пожертвованию живёт на статической странице "Помочь",
 * а не в этом контексте — здесь только учёт донатов куратором.
 */
@Component({
  selector: 'app-admin-donation-list-page',
  standalone: true,
  imports: [SectionComponent],
  templateUrl: './admin-donation-list-page.component.html',
  styleUrl: './admin-donation-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDonationListPageComponent {}
