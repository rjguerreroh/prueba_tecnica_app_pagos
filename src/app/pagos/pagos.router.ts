import { Routes } from '@angular/router';
import { PagosListComponent } from './pages/pagos-list/pagos-list.component';
import { PagoFormComponent } from './pages/pago-form/pago-form.component';
import { LayoutComponent } from '../layout/layout.component';

export const PAGOS_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        component: PagosListComponent
      },
      {
        path: 'form',
        component: PagoFormComponent
      }
    ]
  },
];