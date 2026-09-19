import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ButtonComponent } from '@shared/ui/button';
import { SectionComponent } from '@shared/ui/section';

/**
 * Страница "О нас" (пункт навигации в docs/scheme/main-page.txt). Чисто статический
 * контент — не бизнес-домен, поэтому без DDD-слоёв. Текст основан на реальном описании
 * группы «9 жизней» (Елабуга) — нет приюта-здания, это сеть волонтёров, см. обсуждение
 * в чате.
 */
@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [SectionComponent, ButtonComponent],
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPageComponent {}
