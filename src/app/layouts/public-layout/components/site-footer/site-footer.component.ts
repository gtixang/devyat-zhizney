import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Подвал публичного сайта. Минимальный состав ссылок — расширяется
 * по мере появления реальных страниц (docs/scheme).
 */
@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './site-footer.component.html',
  styleUrl: './site-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiteFooterComponent {
  protected readonly currentYear = new Date().getFullYear();
}
