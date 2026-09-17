import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, computed, effect, inject, input, signal } from '@angular/core';

/** После этого сдвига пальцем/мышью (px) считаем это свайпом, а не тапом. */
const SWIPE_THRESHOLD_PX = 50;
/** До этого сдвига (px) — ещё тап (открыть полноэкранный режим), а не начало перетаскивания. */
const TAP_THRESHOLD_PX = 10;

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
 *
 * Переключение фото — горизонтальная лента (track) со сдвигом transform,
 * это же самое перетаскивание отвечает и за свайп, и за live-отслеживание
 * пальца/мыши во время перетаскивания. Полноэкранный режим — тот же самый
 * DOM, просто хост получает модификатор `--fullscreen` (position: fixed на
 * весь экран), поэтому свайп и стрелки работают одинаково в обоих режимах.
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

  protected readonly hasPhotos = computed(() => this.photos().length > 0);
  protected readonly hasMultiplePhotos = computed(() => this.photos().length > 1);

  protected readonly canGoPrevious = computed(() => this.activeIndex() > 0);
  protected readonly canGoNext = computed(() => this.activeIndex() < this.photos().length - 1);

  protected readonly isFullscreen = signal(false);

  private readonly isDragging = signal(false);
  private readonly dragOffsetPx = signal(0);
  private dragStartX = 0;
  private dragMoved = false;

  protected readonly trackTransform = computed(
    () => `translateX(calc(${-this.activeIndex() * 100}% + ${this.dragOffsetPx()}px))`
  );
  protected readonly trackTransition = computed(() => (this.isDragging() ? 'none' : 'transform 320ms ease'));

  constructor() {
    // Новый набор фото (другое животное) — начинаем сначала и забываем прошлые сбои загрузки.
    effect(() => {
      this.photos();
      this.activeIndex.set(0);
      this.failedIndices.set(new Set());
    });

    // Пока открыт полноэкранный просмотр — страница под ним не должна прокручиваться.
    effect(() => {
      document.body.style.overflow = this.isFullscreen() ? 'hidden' : '';
    });

    inject(DestroyRef).onDestroy(() => {
      document.body.style.overflow = '';
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

  protected toggleFullscreen(): void {
    this.isFullscreen.update((value) => !value);
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (this.isFullscreen() && event.target === event.currentTarget) {
      this.isFullscreen.set(false);
    }
  }

  protected onPointerDown(event: PointerEvent): void {
    this.isDragging.set(true);
    this.dragMoved = false;
    this.dragStartX = event.clientX;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.isDragging()) {
      return;
    }
    const delta = event.clientX - this.dragStartX;
    if (Math.abs(delta) > TAP_THRESHOLD_PX) {
      this.dragMoved = true;
    }
    if (this.hasMultiplePhotos()) {
      this.dragOffsetPx.set(this.clampDrag(delta));
    }
  }

  protected onPointerUp(): void {
    if (!this.isDragging()) {
      return;
    }
    const delta = this.dragOffsetPx();
    this.isDragging.set(false);
    this.dragOffsetPx.set(0);

    if (this.hasMultiplePhotos() && delta <= -SWIPE_THRESHOLD_PX) {
      this.next();
    } else if (this.hasMultiplePhotos() && delta >= SWIPE_THRESHOLD_PX) {
      this.previous();
    } else if (!this.dragMoved && this.hasPhotos()) {
      this.toggleFullscreen();
    }
  }

  @HostListener('window:keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if (!this.isFullscreen()) {
      return;
    }
    if (event.key === 'Escape') {
      this.isFullscreen.set(false);
    } else if (event.key === 'ArrowLeft') {
      this.previous();
    } else if (event.key === 'ArrowRight') {
      this.next();
    }
  }

  /** Утягивание края ленты назад к последнему/первому фото — не даём "уехать в пустоту". */
  private clampDrag(delta: number): number {
    if ((delta > 0 && !this.canGoPrevious()) || (delta < 0 && !this.canGoNext())) {
      return delta * 0.35;
    }
    return delta;
  }
}
