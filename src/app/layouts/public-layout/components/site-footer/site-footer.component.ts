import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { createCopyWithFeedback } from '@core/clipboard';
import { ORG_PHONE_DISPLAY, ORG_PHONE_RAW, ORG_VK_URL } from '@core/contact';
import { SHARE_TEXT, getTelegramShareUrl, getVkShareUrl, getWhatsAppShareUrl } from '@core/share';

/**
 * Подвал публичного сайта — виден на каждой странице, поэтому здесь же (не только
 * на /help) дублируются контакты (VK/телефон) и кнопки "Поделиться". Логика share-
 * ссылок и копирования в буфер — общая с help-page.component.ts, вынесена в
 * core/share и core/clipboard, чтобы не дублировать её в обоих компонентах.
 */
@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './site-footer.component.html',
  styleUrl: './site-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiteFooterComponent {
  protected readonly currentYear = new Date().getFullYear();

  protected readonly vkUrl = ORG_VK_URL;
  protected readonly phoneRaw = ORG_PHONE_RAW;
  protected readonly phoneDisplay = ORG_PHONE_DISPLAY;

  private readonly shareUrl = window.location.origin;

  protected readonly vkShareUrl = getVkShareUrl(this.shareUrl, SHARE_TEXT);
  protected readonly telegramShareUrl = getTelegramShareUrl(this.shareUrl, SHARE_TEXT);
  protected readonly whatsAppShareUrl = getWhatsAppShareUrl(this.shareUrl, SHARE_TEXT);

  private readonly copyHelper = createCopyWithFeedback(inject(DestroyRef));
  protected readonly copyFeedback = this.copyHelper.feedback;

  protected onCopyLink(): void {
    this.copyHelper.copy(this.shareUrl);
  }
}
