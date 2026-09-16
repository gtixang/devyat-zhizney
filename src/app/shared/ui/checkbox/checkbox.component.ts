import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Нативный input[type="checkbox"], визуально стилизованный под дизайн-систему
 * (docs/design-system/index.html, раздел Checkboxes). Клик, hover, focus, disabled —
 * работают через нативное поведение input, а не через искусственный div.
 */
@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxComponent {
  public readonly checked = input<boolean>(false);
  public readonly disabled = input<boolean>(false);
  public readonly label = input<string>('');

  public readonly checkedChange = output<boolean>();

  protected onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checkedChange.emit(target.checked);
  }
}
