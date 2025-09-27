import { Injectable } from '@angular/core';

export interface AccessPermissions {
  SOLICITAR: boolean;
  AUTORIZAR: boolean;
  PAGAR: boolean;
}

export interface AccessConfig {
  PAGOS: AccessPermissions;
}

export const ACCESS: AccessConfig = {
  PAGOS: { 
    SOLICITAR: true, 
    AUTORIZAR: false, 
    PAGAR: false 
  }
};

@Injectable({ providedIn: 'root' })
export class AccessService {
  access: AccessConfig = ACCESS;

  constructor() {
    // Simular diferentes roles según el usuario
    this.loadUserPermissions();
  }

  private loadUserPermissions(): void {
    // En un caso real, esto vendría de un servicio de autenticación
    const userRole = localStorage.getItem('userRole') || 'solicitante';
    
    switch (userRole) {
      case 'admin':
        this.access.PAGOS = { SOLICITAR: true, AUTORIZAR: true, PAGAR: true };
        break;
      case 'autorizador':
        this.access.PAGOS = { SOLICITAR: true, AUTORIZAR: true, PAGAR: false };
        break;
      case 'solicitante':
      default:
        this.access.PAGOS = { SOLICITAR: true, AUTORIZAR: false, PAGAR: false };
        break;
    }
  }

  canCreate(): boolean {
    return this.access.PAGOS.SOLICITAR;
  }

  canAuthorize(): boolean {
    return this.access.PAGOS.AUTORIZAR;
  }

  canPay(): boolean {
    return this.access.PAGOS.PAGAR;
  }

  canDelete(): boolean {
    return this.access.PAGOS.AUTORIZAR;
  }

  getCurrentRole(): string {
    if (this.access.PAGOS.PAGAR) return 'Administrador';
    if (this.access.PAGOS.AUTORIZAR) return 'Autorizador';
    return 'Solicitante';
  }

  getActivePermissions(): string[] {
    const permissions: string[] = [];
    if (this.access.PAGOS.SOLICITAR) permissions.push('Solicitar');
    if (this.access.PAGOS.AUTORIZAR) permissions.push('Autorizar');
    if (this.access.PAGOS.PAGAR) permissions.push('Pagar');
    return permissions;
  }
}
