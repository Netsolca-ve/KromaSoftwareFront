import { Routes } from '@angular/router';
import { Layout } from './shared/layout/layout';
import { Login } from './pages/login/login';

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
                path: 'client',
                loadComponent: () => import('./pages/client/client').then((m) => m.Client),
            },
            {
                path: 'schedules',
                loadComponent: () => import('./pages/schedules/schedules').then((m) => m.Schedules),
            }
        ],
    },
];
