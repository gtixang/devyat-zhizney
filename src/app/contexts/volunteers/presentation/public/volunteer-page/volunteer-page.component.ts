import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ButtonComponent } from '@shared/ui/button';
import { SectionComponent } from '@shared/ui/section';

/**
 * Публичная страница "Волонтёрам" (docs/scheme/main-page.txt, пункт навигации). Текст
 * основан на реальном описании группы «9 жизней» — см. обсуждение в чате. Формы заявки
 * на волонтёрство пока нет (домен "Волонтёры" не описан ни в одной схеме) — вместо неё
 * пока просто призыв написать куратору напрямую; реальный контакт (телефон/ссылка на
 * группу ВКонтакте) должен подставить владелец сайта — см. TODO в шаблоне.
 */
@Component({
  selector: 'app-volunteer-page',
  standalone: true,
  imports: [SectionComponent, ButtonComponent],
  templateUrl: './volunteer-page.component.html',
  styleUrl: './volunteer-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VolunteerPageComponent {}
