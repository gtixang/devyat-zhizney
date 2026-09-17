import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';

import { AuthService } from './auth.service';

/**
 * `canMatch`, а не `canActivate` — намеренно (см. обсуждение в чате про приватность
 * /admin). При отказе (`false`, без UrlTree) роутер считает, что маршрута `/admin`
 * вообще не существует, и естественно проваливается дальше по списку — на wildcard
 * 404 (app.routes.ts). Так случайный посетитель, набравший /admin, не получает
 * редирект на /login и не узнаёт, что у сайта вообще есть форма входа.
 *
 * Куратор с протухшей сессией (например, не заходила неделю) увидит тот же 404,
 * что и посторонний — осознанный компромисс ради единообразия и приватности:
 * ей нужно знать/иметь в закладках прямую ссылку на /login, а не переходить по
 * старым ссылкам на /admin/*.
 */
export const authGuard: CanMatchFn = async () => {
  const authService = inject(AuthService);

  await authService.waitUntilReady();

  return authService.isAuthenticated();
};
