import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SectionComponent } from '@shared/ui/section/section.component';

/**
 * Placeholder страницы "Помочь" (docs/scheme/main-page.txt, раздел "КАК МОЖНО ПОМОЧЬ":
 * Приютить, Передержка, Волонтёрство, Пожертвовать, Корм/вещи, Рассказать друзьям).
 * Это единая статическая информационная страница, а не отдельные фичи — контексты
 * foster/donations здесь используются только куратором в админ-панели.
 */
@Component({
  selector: 'app-help-page',
  standalone: true,
  imports: [SectionComponent],
  templateUrl: './help-page.component.html',
  styleUrl: './help-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelpPageComponent {}
