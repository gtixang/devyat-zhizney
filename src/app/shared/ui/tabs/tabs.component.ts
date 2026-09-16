import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

export interface TabItem {
  readonly id: string;
  readonly label: string;
}

/**
 * Рабочий компонент вкладок (docs/design-system/index.html, раздел Tabs):
 * переключение по клику, видимый active/focus, доступен с клавиатуры.
 */
@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsComponent {
  public readonly tabs = input.required<readonly TabItem[]>();
  public readonly initialActiveId = input<string | undefined>(undefined);
  public readonly ariaLabel = input<string>('');

  public readonly activeIdChange = output<string>();

  private readonly selectedId = signal<string | undefined>(undefined);

  protected readonly activeId = computed(() => this.selectedId() ?? this.initialActiveId() ?? this.tabs()[0]?.id);

  protected onSelect(tabId: string): void {
    this.selectedId.set(tabId);
    this.activeIdChange.emit(tabId);
  }
}
