import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface AdminNavItem {
  readonly label: string;
  readonly path: string;
}

/**
 * Навигация админ-панели куратора (docs/scheme/admin-panel.txt).
 */
@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminSidebarComponent {
  protected readonly navItems: readonly AdminNavItem[] = [
    { label: 'Главная', path: '/admin' },
    { label: 'Животные', path: '/admin/animals' },
    { label: 'Заявки', path: '/admin/applications' },
    { label: 'Волонтёры', path: '/admin/volunteers' },
    { label: 'Передержки', path: '/admin/foster' },
    { label: 'Донаты', path: '/admin/donations' },
    { label: 'Новости', path: '/admin/news' },
    { label: 'События', path: '/admin/events' },
    { label: 'Настройки', path: '/admin/settings' }
  ];
}
