import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { AccessService } from '../../pagos/services/access.service';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrl: './menu-bar.component.css'
})
export class MenuBarComponent implements OnInit {
  items: MenuItem[] = [];
  userRole: string = '';
  
  // Opciones para el selector de rol
  roleOptions = [
    { label: 'Administrador', value: 'admin' },
    { label: 'Autorizador', value: 'autorizador' },
    { label: 'Solicitante', value: 'solicitante' }
  ];
  
  selectedRole: string = 'admin';

  constructor(
    private router: Router,
    public access: AccessService
  ) {}

  ngOnInit() {
    // Cargar rol actual desde localStorage
    const currentRole = localStorage.getItem('userRole') || 'admin';
    this.selectedRole = currentRole;
    this.userRole = this.access.getCurrentRole();
    this.items = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        routerLink: ['/pagos']
      },
      {
        label: 'Pagos',
        icon: 'pi pi-credit-card',
        items: [
          {
            label: 'Lista de Pagos',
            icon: 'pi pi-list',
            routerLink: ['/pagos']
          },
          {
            label: 'Crear Pago',
            icon: 'pi pi-plus',
            routerLink: ['/pagos/form'],
            queryParams: { mode: 'create' },
            visible: this.access.canCreate()
          }
        ]
      },
      {
        label: 'Reportes',
        icon: 'pi pi-chart-bar',
        items: [
          {
            label: 'Exportar CSV',
            icon: 'pi pi-download',
            command: () => this.exportData()
          },
          {
            label: 'Resumen Financiero',
            icon: 'pi pi-calculator'
          }
        ]
      },
      {
        label: 'Configuración',
        icon: 'pi pi-cog',
        items: [
          {
            label: 'Perfil de Usuario',
            icon: 'pi pi-user'
          },
          {
            label: 'Permisos',
            icon: 'pi pi-shield',
            visible: this.access.canAuthorize()
          }
        ]
      }
    ];
  }

  private exportData(): void {
    // Lógica para exportar datos
    console.log('Exportando datos...');
  }

  // Método para cambiar el rol del usuario
  onRoleChange(): void {
    localStorage.setItem('userRole', this.selectedRole);
    // Recargar los permisos del servicio
    this.access.loadUserPermissions();
    this.userRole = this.access.getCurrentRole();
    
    // Recargar la página para aplicar los nuevos permisos
    window.location.reload();
  }
}
