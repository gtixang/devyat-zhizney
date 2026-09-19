import { EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { Route, Routes, UrlSegment } from '@angular/router';

/**
 * Структура маршрутов основана на docs/scheme (general-schema.txt, main-page.txt,
 * admin-panel.txt). Публичные и админ-маршруты разделены через два layout-компонента,
 * каждый feature-маршрут — отдельный lazy-loaded чанк (loadComponent).
 *
 * `/admin` защищён authGuard (core/auth/auth.guard.ts) через `canMatch`, а не
 * `canActivate`, — намеренно: неавторизованному посетителю маршрут не подставляет
 * редирект на /login (не палит существование формы входа), а падает на wildcard 404,
 * будто /admin вообще не существует (см. комментарий в auth.guard.ts). Публичной
 * регистрации нет: аккаунты кураторов заводятся вручную в Supabase Dashboard.
 *
 * Все ленивые `import()` в этом файле (static-pages, layouts, страницы контекстов,
 * authGuard) намеренно указывают на файл компонента напрямую
 * (`@static-pages/home-page/home-page.component`), а не на barrel `index.ts`
 * (`@static-pages/home-page`), хотя barrel для каждой из этих папок существует —
 * импорт через index даёт чанку в сборке безликое имя "index" вместо, например,
 * "home-page-component" (Angular называет lazy-чанк по последнему сегменту пути
 * импорта), что затрудняет чтение отчёта сборки и профилирование в DevTools.
 * Проверено сборкой в обе стороны (см. CLAUDE.md, раздел "Импорты").
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@layouts/public-layout/public-layout.component').then((m) => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('@static-pages/home-page/home-page.component').then((m) => m.HomePageComponent)
      },
      {
        path: 'about',
        loadComponent: () => import('@static-pages/about-page/about-page.component').then((m) => m.AboutPageComponent)
      },
      {
        path: 'help',
        loadComponent: () => import('@static-pages/help-page/help-page.component').then((m) => m.HelpPageComponent)
      },
      {
        // Путь намеренно не '/login' — см. обсуждение в чате про приватность /admin:
        // осмысленное слово в адресе облегчает случайное обнаружение и автосканирование
        // ботами (которые перебирают типовые /login, /admin, /wp-admin и т.п.). Реальная
        // защита данных — пароль куратора и RLS в Supabase, это лишь доп. слой обфускации,
        // не шифрование: путь всё равно виден в скомпилированном JS всем, кто откроет
        // DevTools. Куратору нужно знать/иметь в закладках эту ссылку напрямую.
        path: 'curator-ed40',
        loadComponent: () => import('@static-pages/login-page/login-page.component').then((m) => m.LoginPageComponent)
      },
      {
        path: 'animals',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('@contexts/animals/presentation/public/animal-catalog-page/animal-catalog-page.component').then(
                (m) => m.AnimalCatalogPageComponent
              )
          },
          {
            path: ':id',
            loadComponent: () =>
              import('@contexts/animals/presentation/public/animal-detail-page/animal-detail-page.component').then(
                (m) => m.AnimalDetailPageComponent
              )
          },
          {
            path: ':animalId/adopt',
            loadComponent: () =>
              import('@contexts/adoption/presentation/public/adoption-application-page/adoption-application-page.component').then(
                (m) => m.AdoptionApplicationPageComponent
              )
          }
        ]
      },
      {
        path: 'volunteers',
        loadComponent: () =>
          import('@contexts/volunteers/presentation/public/volunteer-page/volunteer-page.component').then(
            (m) => m.VolunteerPageComponent
          )
      },
      {
        path: 'news',
        loadComponent: () =>
          import('@contexts/news/presentation/public/news-list-page/news-list-page.component').then(
            (m) => m.NewsListPageComponent
          )
      }
    ]
  },
  {
    path: 'admin',
    // Ленивый импорт: authGuard тянет AuthService → Supabase-клиент, и статический
    // импорт затянул бы @supabase/supabase-js в eager-бандл для ВСЕХ страниц сайта.
    // EnvironmentInjector захватывается синхронно (внутри guard-контекста Angular),
    // а runInInjectionContext восстанавливает контекст для inject() внутри authGuard(),
    // который выполнится уже после асинхронной динамической загрузки модуля.
    canMatch: [
      (route: Route, segments: UrlSegment[]) => {
        const injector = inject(EnvironmentInjector);
        return import('@core/auth/auth.guard').then((m) =>
          runInInjectionContext(injector, () => m.authGuard(route, segments))
        );
      }
    ],
    loadComponent: () => import('@layouts/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@static-pages/admin-dashboard-page/admin-dashboard-page.component').then((m) => m.AdminDashboardPageComponent)
      },
      {
        path: 'animals',
        loadComponent: () =>
          import('@contexts/animals/presentation/admin/admin-animal-list-page/admin-animal-list-page.component').then(
            (m) => m.AdminAnimalListPageComponent
          )
      },
      {
        path: 'animals/new',
        loadComponent: () =>
          import('@contexts/animals/presentation/admin/admin-animal-form-page/admin-animal-form-page.component').then(
            (m) => m.AdminAnimalFormPageComponent
          )
      },
      {
        // Должен идти после 'animals/new' — иначе ':id' перехватил бы 'new' как id животного.
        path: 'animals/:id',
        loadComponent: () =>
          import('@contexts/animals/presentation/admin/admin-animal-detail-page/admin-animal-detail-page.component').then(
            (m) => m.AdminAnimalDetailPageComponent
          )
      },
      {
        path: 'animals/:id/edit',
        loadComponent: () =>
          import('@contexts/animals/presentation/admin/admin-animal-form-page/admin-animal-form-page.component').then(
            (m) => m.AdminAnimalFormPageComponent
          )
      },
      {
        path: 'applications',
        loadComponent: () =>
          import('@contexts/adoption/presentation/admin/admin-application-list-page/admin-application-list-page.component').then(
            (m) => m.AdminApplicationListPageComponent
          )
      },
      {
        path: 'volunteers',
        loadComponent: () =>
          import('@contexts/volunteers/presentation/admin/admin-volunteer-list-page/admin-volunteer-list-page.component').then(
            (m) => m.AdminVolunteerListPageComponent
          )
      },
      {
        path: 'foster',
        loadComponent: () =>
          import('@contexts/foster/presentation/admin/admin-foster-list-page/admin-foster-list-page.component').then(
            (m) => m.AdminFosterListPageComponent
          )
      },
      {
        path: 'donations',
        loadComponent: () =>
          import('@contexts/donations/presentation/admin/admin-donation-list-page/admin-donation-list-page.component').then(
            (m) => m.AdminDonationListPageComponent
          )
      },
      {
        path: 'news',
        loadComponent: () =>
          import('@contexts/news/presentation/admin/admin-news-list-page/admin-news-list-page.component').then(
            (m) => m.AdminNewsListPageComponent
          )
      },
      {
        path: 'events',
        loadComponent: () =>
          import('@contexts/events/presentation/admin/admin-event-list-page/admin-event-list-page.component').then(
            (m) => m.AdminEventListPageComponent
          )
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('@static-pages/admin-settings-page/admin-settings-page.component').then((m) => m.AdminSettingsPageComponent)
      }
    ]
  },
  {
    // Catch-all — обязательно последним в корневом массиве routes, а не внутри children
    // маршрута '' (у публичного layout): '' сам ничего не проверяет и передаёт весь URL
    // своим children, поэтому wildcard там перехватил бы и несуществующие /admin/* пути
    // раньше, чем роутер вообще попробует маршрут 'admin'. На верхнем уровне он сработает,
    // только когда не подошёл ни один из маршрутов выше — включая admin (в том числе когда
    // canMatch у admin отклонил неавторизованного посетителя).
    //
    // Обёрнут в тот же PublicLayoutComponent (header/footer), что и остальные публичные
    // страницы: '**' сам поглощает весь оставшийся URL, а дочернему '' достаётся уже
    // пустой остаток — такая вложенность специально проверена тестом роутера.
    path: '**',
    loadComponent: () => import('@layouts/public-layout/public-layout.component').then((m) => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@static-pages/not-found-page/not-found-page.component').then((m) => m.NotFoundPageComponent)
      }
    ]
  }
];
