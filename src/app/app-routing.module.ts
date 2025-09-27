import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PAGOS_ROUTES } from './pagos/pagos.router';

const routes: Routes = [
  {
    path: 'pagos',
    children: PAGOS_ROUTES
  },
  {
    path: '',
    redirectTo: 'pagos',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'pagos'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
