import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ORG_PHONE_RAW } from '@core/contact';
import { CardComponent } from '@shared/ui/card';
import { SectionComponent } from '@shared/ui/section';
import { SHARE_TEXT, getTelegramShareUrl, getVkShareUrl, getWhatsAppShareUrl } from './help-page.constants';

/** На сколько показываем "Скопировано" после успешного копирования в буфер. */
const COPY_FEEDBACK_MS = 2000;

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
 * понятнее и надёжнее универсального navigator.share() (которого нет в десктопных
 * браузерах и который просто открывает системное меню, а не конкретные соцсети).
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

  protected readonly copyFeedback = signal<'idle' | 'copied' | 'error'>('idle');

  private copyFeedbackTimeoutId: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.copyFeedbackTimeoutId));
  }

  protected onCopyPhone(): void {
    void this.copyToClipboard(this.donationPhone);
  }

  protected onCopyLink(): void {
    void this.copyToClipboard(this.shareUrl);
  }

  private async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.showCopyFeedback('copied');
    } catch {
      this.showCopyFeedback('error');
    }
  }

  private showCopyFeedback(state: 'copied' | 'error'): void {
    this.copyFeedback.set(state);
    clearTimeout(this.copyFeedbackTimeoutId);
    this.copyFeedbackTimeoutId = setTimeout(() => this.copyFeedback.set('idle'), COPY_FEEDBACK_MS);
  }
}
