import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { ButtonComponent } from '@shared/ui/button/button.component';

/**
 * Публичная шапка сайта (docs/scheme/main-page.txt): лого, навигация,
 * акцентная CTA-пилюля. На мобильном навигация сворачивается в отдельное меню.
 */
@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ButtonComponent],
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiteHeaderComponent {
  protected readonly isMobileMenuOpen = signal(false);

  protected onToggleMobileMenu(): void {
    this.isMobileMenuOpen.update((isOpen) => !isOpen);
  }

  protected onCloseMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
}
