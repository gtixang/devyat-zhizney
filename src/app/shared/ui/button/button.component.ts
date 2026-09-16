import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'text';
export type ButtonSize = 'default' | 'sm';

/**
 * Базовая pill-кнопка дизайн-системы (docs/design-system/index.html, раздел Buttons).
 * Единая геометрия для всех вариантов — различие только в заливке/обводке.
 *
 * Если задан `link`, рендерится как <a [routerLink]>, а не <button> — это позволяет
 * использовать один и тот же визуальный компонент и для действий, и для навигации
 * (например, CTA в шапке сайта), не дублируя стили `.btn` вне компонента.
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [RouterLink, NgTemplateOutlet],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  public readonly variant = input<ButtonVariant>('primary');
  public readonly size = input<ButtonSize>('default');
  public readonly type = input<'button' | 'submit'>('button');
  public readonly disabled = input<boolean>(false);
  public readonly link = input<string | undefined>(undefined);
  public readonly fullWidth = input<boolean>(false);

  public readonly pressed = output<void>();

  protected onClick(): void {
    if (!this.disabled()) {
      this.pressed.emit();
    }
  }
}
