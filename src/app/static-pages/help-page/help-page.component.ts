import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CardComponent } from '@shared/ui/card';
import { SectionComponent } from '@shared/ui/section';
import { DONATION_PHONE_RAW } from './help-page.constants';

/** На сколько показываем "Скопировано" после успешного копирования в буфер. */
const COPY_FEEDBACK_MS = 2000;

/**
 * Страница "Помочь" (docs/scheme/main-page.txt, раздел "КАК МОЖНО ПОМОЧЬ": Приютить,
 * Передержка, Волонтёрство, Пожертвовать, Корм/вещи, Рассказать друзьям). Единая
 * статическая информационная страница, а не отдельные фичи — контексты foster/donations
 * используются только куратором в админ-панели.
 *
 * "Пожертвовать" и "Корм/вещи" ведут не на отдельные маршруты, а на секции этой же
 * страницы (fragment-ссылки `#donate`/`#goods`) — им нужно больше места (QR-код,
 * реквизиты), чем помещается в компактную плитку.
 *
 * QR-код в public/donate-qr.png закодирован как обычный номер телефона (не платёжная
 * ссылка конкретного банка) — я не могу выпустить настоящий SBP-QR за куратора, это
 * делается через личный кабинет её банка. Задача QR — не дать ошибиться при вводе
 * номера, а не запустить перевод одним сканированием.
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
  protected readonly donationPhone = DONATION_PHONE_RAW;

  protected readonly copyFeedback = signal<'idle' | 'copied' | 'error'>('idle');

  private copyFeedbackTimeoutId: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.copyFeedbackTimeoutId));
  }

  protected onCopyPhone(): void {
    void this.copyToClipboard(this.donationPhone);
  }

  /**
   * Web Share API — открывает системное меню "Поделиться" (доступно почти везде на
   * мобильных, но не в десктопных браузерах). Там, где его нет, просто копируем ссылку
   * на сайт в буфер обмена — тоже валидный способ "поделиться".
   */
  protected async onShare(): Promise<void> {
    const shareData: ShareData = {
      title: 'Девять жизней',
      text: 'Волонтёрская группа «Девять жизней» помогает бездомным животным найти дом.',
      url: window.location.origin
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // Пользователь закрыл системное меню — не ошибка, ничего не делаем.
      }
      return;
    }

    await this.copyToClipboard(shareData.url ?? window.location.origin);
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
