import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SectionComponent } from '@shared/ui/section';

/**
 * Placeholder страницы "Настройки" админ-панели (docs/scheme/admin-panel.txt).
 */
@Component({
  selector: 'app-admin-settings-page',
  standalone: true,
  imports: [SectionComponent],
  templateUrl: './admin-settings-page.component.html',
  styleUrl: './admin-settings-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminSettingsPageComponent {}
