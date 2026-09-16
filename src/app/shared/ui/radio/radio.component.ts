import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Нативный input[type="radio"]. Группировка — через одинаковый `name`
 * у нескольких app-radio (как у обычных нативных radio-групп).
 */
@Component({
  selector: 'app-radio',
  standalone: true,
  imports: [],
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioComponent {
  public readonly name = input.required<string>();
  public readonly value = input<string>('');
  public readonly checked = input<boolean>(false);
  public readonly disabled = input<boolean>(false);
  public readonly label = input<string>('');

  public readonly checkedChange = output<string>();

  protected onChange(): void {
    this.checkedChange.emit(this.value());
  }
}
