import { Routes } from '@angular/router';
import { Layout } from './shared/layout/layout';
import { Login } from './@core/auth/login/login';

export const routes: Routes = [
     {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
    {
        path: 'login',
        component: Login,
    },
    {
        path: '',
        component: Layout,
        children: [
            {
                path: 'home',
                loadComponent: () => import('./pages/home/home').then((m) => m.Home),
            },
            {
                path: 'payments',
                loadComponent: () => import('./pages/payments/payments').then((m) => m.Payments),
            },
            {
                path: 'about',
                loadComponent: () => import('./pages/about/about').then((m) => m.About),
            },
            {
                path: 'walk-ins',
                loadComponent: () => import('./pages/walk-ins/walk-ins').then((m) => m.WalkIns),

            },
            {
                path: 'barb-services',
                loadComponent: () => import('./pages/barb-services/barb-services').then((m) => m.BarbServices),
            },
            {
                path: 'schedules',
                loadComponent: () => import('./pages/schedules/schedules').then((m) => m.Schedules),
            }
        ],
    },
];
