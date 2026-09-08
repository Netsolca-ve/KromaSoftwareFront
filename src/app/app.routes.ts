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
        ],
    },
];
