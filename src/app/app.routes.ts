import { EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';

/**
 * Структура маршрутов основана на docs/scheme (general-schema.txt, main-page.txt,
 * admin-panel.txt). Публичные и админ-маршруты разделены через два layout-компонента,
 * каждый feature-маршрут — отдельный lazy-loaded чанк (loadComponent).
 *
 * `/admin` защищён authGuard (core/auth/auth.guard.ts) — неавторизованный посетитель
 * перенаправляется на /login. Публичной регистрации нет: аккаунты кураторов заводятся
 * вручную в Supabase Dashboard.
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
        path: 'login',
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
    canActivate: [
      (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
        const injector = inject(EnvironmentInjector);
        return import('@core/auth/auth.guard').then((m) =>
          runInInjectionContext(injector, () => m.authGuard(route, state))
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
          import(
            '@contexts/animals/presentation/admin/admin-animal-create-page/admin-animal-create-page.component'
          ).then((m) => m.AdminAnimalCreatePageComponent)
      },
      {
        path: 'applications',
        loadComponent: () =>
          import(
            '@contexts/adoption/presentation/admin/admin-application-list-page/admin-application-list-page.component'
          ).then((m) => m.AdminApplicationListPageComponent)
      },
      {
        path: 'volunteers',
        loadComponent: () =>
          import(
            '@contexts/volunteers/presentation/admin/admin-volunteer-list-page/admin-volunteer-list-page.component'
          ).then((m) => m.AdminVolunteerListPageComponent)
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
  }
];
