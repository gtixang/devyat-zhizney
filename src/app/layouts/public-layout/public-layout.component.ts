import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SiteFooterComponent } from './components/site-footer/site-footer.component';
import { SiteHeaderComponent } from './components/site-header/site-header.component';

/**
 * Оболочка публичного сайта: Header + основной контент маршрута + Footer
 * (docs/scheme/main-page.txt).
 */
@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, SiteHeaderComponent, SiteFooterComponent],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublicLayoutComponent {}
