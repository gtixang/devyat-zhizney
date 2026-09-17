import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '@core/auth/auth.service';
import { ButtonComponent } from '@shared/ui/button/button.component';

/**
 * Верхняя панель админ-панели (docs/scheme/admin-panel.txt: "Добрый день, Анна").
 * Приветствие берётся из текущей Supabase-сессии, если она уже есть.
 */
@Component({
  selector: 'app-admin-topbar',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './admin-topbar.component.html',
  styleUrl: './admin-topbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminTopbarComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected async onSignOut(): Promise<void> {
    await this.authService.signOut();
    await this.router.navigate(['/']);
  }
}
