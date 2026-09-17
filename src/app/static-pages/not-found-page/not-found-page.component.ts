import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ButtonComponent } from '@shared/ui/button';

/**
 * Страница 404 — catch-all маршрут (`path: '**'`) внутри публичного layout
 * (app.routes.ts), поэтому у неё остаются header/footer сайта, как у обычной страницы.
 */
@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './not-found-page.component.html',
  styleUrl: './not-found-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundPageComponent {}
