import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Базовая тёмная поверхность-контейнер (surface + border + radius).
 * Используется как основа для более специфичных карточек контекстов (например, AnimalCard).
 */
@Component({
  selector: 'app-card',
  standalone: true,
  imports: [],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  public readonly hoverable = input<boolean>(false);
}
