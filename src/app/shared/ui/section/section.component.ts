import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Паттерн "section heading" (docs/design-system/index.html, раздел Sections):
 * маленький eyebrow-лейбл + крупный заголовок + контент секции через ng-content.
 */
@Component({
  selector: 'app-section',
  standalone: true,
  imports: [],
  templateUrl: './section.component.html',
  styleUrl: './section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SectionComponent {
  public readonly eyebrow = input<string>('');
  public readonly heading = input<string>('');
  /** Уровень заголовка секции. По умолчанию h2 — для повторяющихся секций внутри страницы.
   *  h1 — для секции, которая одновременно является главным заголовком страницы. */
  public readonly headingLevel = input<'h1' | 'h2'>('h2');
}
