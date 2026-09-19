import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { ORG_PHONE_DISPLAY, ORG_PHONE_RAW, ORG_VK_URL } from '@core/contact';
import { ButtonComponent } from '@shared/ui/button';

/**
 * Публичная шапка сайта (docs/scheme/main-page.txt): лого, навигация,
 * акцентная CTA-пилюля, ссылка на группу ВКонтакте и телефон куратора.
 * На мобильном навигация и контакты сворачиваются в отдельное меню.
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
  protected readonly vkUrl = ORG_VK_URL;
  protected readonly phoneRaw = ORG_PHONE_RAW;
  protected readonly phoneDisplay = ORG_PHONE_DISPLAY;

  protected readonly isMobileMenuOpen = signal(false);

  protected onToggleMobileMenu(): void {
    this.isMobileMenuOpen.update((isOpen) => !isOpen);
  }

  protected onCloseMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
}
