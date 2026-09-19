import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { createCopyWithFeedback } from '@core/clipboard';
import { ORG_PHONE_RAW } from '@core/contact';
import { CardComponent } from '@shared/ui/card';
import { SectionComponent } from '@shared/ui/section';

/**
 * Страница "Помочь" (docs/scheme/main-page.txt, раздел "КАК МОЖНО ПОМОЧЬ"). Единая
 * статическая информационная страница, а не отдельные фичи — контексты foster/donations
 * используются только куратором в админ-панели.
 *
 * Плитки "Передержка" и "Волонтёрство" объединены в одну — обе вели на один и тот же
 * /volunteers (передержка там же перечислена первым пунктом среди способов помочь),
 * так что отдельная плитка была лишней. Плитка "Рассказать друзьям" убрана вместе с
 * соответствующей секцией `#share` — те же кнопки-иконки соцсетей уже есть в футере
 * на каждой странице (site-footer.component), держать их продублированными именно
 * здесь смысла не было.
 *
 * "Пожертвовать" и "Корм/вещи" по-прежнему ведут не на отдельные маршруты, а на секции
 * этой же страницы (fragment-ссылки `#donate`/`#goods`) — им нужно больше места, чем
 * помещается в компактную плитку.
 */
@Component({
  selector: 'app-help-page',
  standalone: true,
  imports: [RouterLink, CardComponent, SectionComponent],
  templateUrl: './help-page.component.html',
  styleUrl: './help-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelpPageComponent {
  protected readonly donationPhone = ORG_PHONE_RAW;

  private readonly copyHelper = createCopyWithFeedback(inject(DestroyRef));
  protected readonly copyFeedback = this.copyHelper.feedback;

  protected onCopyPhone(): void {
    this.copyHelper.copy(this.donationPhone);
  }
}
