import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { createCopyWithFeedback } from '@core/clipboard';
import { ORG_PHONE_RAW } from '@core/contact';
import { SHARE_TEXT, getTelegramShareUrl, getVkShareUrl, getWhatsAppShareUrl } from '@core/share';
import { CardComponent } from '@shared/ui/card';
import { SectionComponent } from '@shared/ui/section';

/**
 * Страница "Помочь" (docs/scheme/main-page.txt, раздел "КАК МОЖНО ПОМОЧЬ": Приютить,
 * Передержка, Волонтёрство, Пожертвовать, Корм/вещи, Рассказать друзьям). Единая
 * статическая информационная страница, а не отдельные фичи — контексты foster/donations
 * используются только куратором в админ-панели.
 *
 * "Пожертвовать" и "Корм/вещи" ведут не на отдельные маршруты, а на секции этой же
 * страницы (fragment-ссылки `#donate`/`#goods`) — им нужно больше места, чем помещается
 * в компактную плитку.
 *
 * "Рассказать друзьям" — конкретные кнопки-иконки соцсетей (VK/Telegram/WhatsApp) со
 * стандартными share-ссылками этих платформ, плюс копирование ссылки в буфер — так
 * понятнее и надёжнее универсального navigator.share(). Тот же блок продублирован
 * в футере (site-footer.component) — общая логика вынесена в core/share и
 * core/clipboard, чтобы не дублировать её здесь и там.
 */
@Component({
  selector: 'app-help-page',
  standalone: true,
  imports: [RouterLink, CardComponent, SectionComponent],
  templateUrl: './help-page.component.html',
  styleUrl: './help-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelpPageComponent {
  protected readonly donationPhone = ORG_PHONE_RAW;

  private readonly shareUrl = window.location.origin;

  protected readonly vkShareUrl = getVkShareUrl(this.shareUrl, SHARE_TEXT);
  protected readonly telegramShareUrl = getTelegramShareUrl(this.shareUrl, SHARE_TEXT);
  protected readonly whatsAppShareUrl = getWhatsAppShareUrl(this.shareUrl, SHARE_TEXT);

  private readonly copyHelper = createCopyWithFeedback(inject(DestroyRef));
  protected readonly copyFeedback = this.copyHelper.feedback;

  protected onCopyPhone(): void {
    this.copyHelper.copy(this.donationPhone);
  }

  protected onCopyLink(): void {
    this.copyHelper.copy(this.shareUrl);
  }
}
