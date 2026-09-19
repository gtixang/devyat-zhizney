import { DestroyRef, Signal, signal } from '@angular/core';

export type CopyFeedback = 'idle' | 'copied' | 'error';

/** На сколько показываем "Скопировано"/"Не получилось" после попытки копирования. */
const FEEDBACK_RESET_MS = 2000;

export interface CopyWithFeedback {
  readonly feedback: Signal<CopyFeedback>;
  copy(text: string): void;
}

/**
 * "Скопировать в буфер + временно показать результат" — нужно и странице "Помочь"
 * (копирование номера/ссылки), и футеру (копирование ссылки в блоке "Поделиться").
 * Общий хелпер вместо дублирования одного и того же сигнала+таймера в двух местах.
 *
 * Вызывать из конструктора компонента (нужен активный injection context для
 * DestroyRef) — `private readonly copy = createCopyWithFeedback(inject(DestroyRef));`.
 */
export function createCopyWithFeedback(destroyRef: DestroyRef): CopyWithFeedback {
  const feedback = signal<CopyFeedback>('idle');
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  destroyRef.onDestroy(() => clearTimeout(timeoutId));

  return {
    feedback: feedback.asReadonly(),
    copy(text: string): void {
      clearTimeout(timeoutId);

      const scheduleReset = (): void => {
        timeoutId = setTimeout(() => feedback.set('idle'), FEEDBACK_RESET_MS);
      };

      navigator.clipboard
        .writeText(text)
        .then(() => {
          feedback.set('copied');
          scheduleReset();
        })
        .catch(() => {
          feedback.set('error');
          scheduleReset();
        });
    }
  };
}
