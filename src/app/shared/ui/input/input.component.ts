import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Текстовое поле формы с лейблом, подсказкой и состоянием ошибки
 * (docs/design-system/index.html, раздел Forms). Без интеграции с
 * Angular Forms (ControlValueAccessor) — это осознанно отложено до
 * момента реальной реализации форм (см. отчёт по этапу архитектуры).
 */
@Component({
  selector: 'app-input',
  standalone: true,
  imports: [],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputComponent {
  public readonly label = input<string>('');
  public readonly type = input<string>('text');
  public readonly placeholder = input<string>('');
  public readonly value = input<string>('');
  public readonly hint = input<string>('');
  public readonly error = input<string>('');
  public readonly disabled = input<boolean>(false);
  /** Рендерит <textarea> вместо <input> для многострочных полей (например, "О себе"). */
  public readonly multiline = input<boolean>(false);
  public readonly rows = input<number>(4);
  /** Подсказка мобильной клавиатуре (например, "decimal" для дробных чисел). */
  public readonly inputMode = input<string | undefined>(undefined);

  public readonly valueChange = output<string>();

  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.valueChange.emit(target.value);
  }
}
