import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

/**
 * Зона загрузки файла на базе нативного input[type="file"] (docs/design-system/index.html,
 * раздел Photo upload). Клик по всей зоне открывает системный выбор файла через <label>,
 * без необходимости в дополнительном JS. Показывает локальное превью изображения.
 */
@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadComponent {
  public readonly accept = input<string>('image/*');
  public readonly hint = input<string>('JPG, PNG до 10 МБ');

  public readonly fileSelected = output<File | null>();

  protected readonly previewUrl = signal<string | null>(null);
  protected readonly fileName = signal<string | null>(null);

  protected onChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (this.previewUrl()) {
      URL.revokeObjectURL(this.previewUrl()!);
    }

    if (!file) {
      this.previewUrl.set(null);
      this.fileName.set(null);
      this.fileSelected.emit(null);
      return;
    }

    this.fileName.set(file.name);
    this.previewUrl.set(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
    this.fileSelected.emit(file);
  }
}
