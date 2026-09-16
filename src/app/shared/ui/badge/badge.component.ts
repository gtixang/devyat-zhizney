import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type BadgeTone = 'neutral' | 'primary' | 'accent' | 'warning' | 'error' | 'success';

/**
 * Нейтральный визуальный носитель статуса (pill). Сам компонент не знает
 * о доменных статусах ("Ищет дом", "NEW" и т.д.) — маппинг конкретного
 * доменного статуса в tone делает вызывающий feature-компонент, чтобы shared/ui
 * оставался независимым от бизнес-логики контекстов (docs/design-system/_description.json).
 */
@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeComponent {
  public readonly tone = input<BadgeTone>('neutral');
}
