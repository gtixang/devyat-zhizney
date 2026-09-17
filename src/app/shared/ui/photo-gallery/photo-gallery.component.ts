import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';

/**
 * Галерея фото: большое фото + стрелки next/prev + строка миниатюр под ним
 * (docs/design-system — паттерн подсказан пользователем на примере с другого сайта).
 * Слайдер-логика намеренно вынесена сюда, в shared/ui, а не написана прямо в
 * animal-detail-page — как и остальные переиспользуемые UI-элементы проекта
 * (button, tabs, badge и т.д.), чтобы её можно было использовать где угодно ещё.
 *
 * Своя собственная обработка "фото не загрузилось" на уровне КАЖДОГО индекса
 * (а не одним общим флагом, как раньше было в animal-detail-page) — если не
 * догрузилось одно фото из пяти, остальные четыре остаются рабочими.
 */
@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [],
  templateUrl: './photo-gallery.component.html',
  styleUrl: './photo-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PhotoGalleryComponent {
  public readonly photos = input<readonly string[]>([]);
  /** Для alt-текста фото и подписи миниатюр (например, кличка животного). */
  public readonly alt = input<string>('');

  protected readonly activeIndex = signal(0);
  private readonly failedIndices = signal<ReadonlySet<number>>(new Set());

  protected readonly hasMultiplePhotos = computed(() => this.photos().length > 1);

  protected readonly currentPhoto = computed(() => {
    const photos = this.photos();
    const index = this.activeIndex();
    if (index < 0 || index >= photos.length || this.failedIndices().has(index)) {
      return undefined;
    }
    return photos[index];
  });

  protected readonly canGoPrevious = computed(() => this.activeIndex() > 0);
  protected readonly canGoNext = computed(() => this.activeIndex() < this.photos().length - 1);

  constructor() {
    // Новый набор фото (другое животное) — начинаем сначала и забываем прошлые сбои загрузки.
    effect(() => {
      this.photos();
      this.activeIndex.set(0);
      this.failedIndices.set(new Set());
    });
  }

  protected selectIndex(index: number): void {
    this.activeIndex.set(index);
  }

  protected previous(): void {
    if (this.canGoPrevious()) {
      this.activeIndex.update((index) => index - 1);
    }
  }

  protected next(): void {
    if (this.canGoNext()) {
      this.activeIndex.update((index) => index + 1);
    }
  }

  protected isFailed(index: number): boolean {
    return this.failedIndices().has(index);
  }

  protected onImageError(index: number): void {
    this.failedIndices.update((indices) => new Set(indices).add(index));
  }
}
