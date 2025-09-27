import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Pago } from '../../models/pago.model';
import { PagosService } from '../../services/pagos.service';
import { AccessService } from '../../services/access.service';

@Component({
  selector: 'app-pagos-list',
  templateUrl: './pagos-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PagosListComponent implements OnInit {
  @ViewChild('dt') table!: Table;
  
  // Observables
  pagos$!: Observable<Pago[]>;
  loading$ = this.pagosService.loading$;
  
  // Datos filtrados
  filteredPagos: Pago[] = [];
  totalPagos: number = 0;
  
  // Paginación
  first: number = 0;
  rows: number = 20;
  
  // Filtros
  globalFilter = '';
  selectedEstados: string[] = [];
  selectedEmpresa: string | null = null;
  dateFrom?: string;
  dateTo?: string;
  dateRange: Date[] = [];
  
  // Opciones para filtros
  estadoOptions = [
    { label: 'PENDIENTE', value: 'PENDIENTE' },
    { label: 'AUTORIZADO', value: 'AUTORIZADO' },
    { label: 'PAGADO', value: 'PAGADO' }
  ];
  empresaOptions: { label: string; value: string }[] = [];
  
  areaOperacionOptions = [
    { label: 'ADMINISTRACIÓN', value: 'ADMINISTRACIÓN' },
    { label: 'OPERACIONES', value: 'OPERACIONES' },
    { label: 'VENTAS', value: 'VENTAS' },
    { label: 'LOGÍSTICA', value: 'LOGÍSTICA' },
    { label: 'TRANSPORTES', value: 'TRANSPORTES' }
  ];

  rubroOptions = [
    { label: 'COMBUSTIBLES', value: 'COMBUSTIBLES' },
    { label: 'MANTENIMIENTO', value: 'MANTENIMIENTO' },
    { label: 'PUBLICIDAD', value: 'PUBLICIDAD' },
    { label: 'TECNOLOGÍA', value: 'TECNOLOGÍA' },
    { label: 'SUMINISTROS', value: 'SUMINISTROS' }
  ];

  formaPagoOptions = [
    { label: 'TRANSFERENCIA', value: 'TRANSFERENCIA' },
    { label: 'TARJETA', value: 'TARJETA' },
    { label: 'EFECTIVO', value: 'EFECTIVO' },
    { label: 'CHEQUE', value: 'CHEQUE' }
  ];

  constructor(
    private pagosService: PagosService,
    private msg: MessageService,
    private confirm: ConfirmationService,
    private router: Router,
    public access: AccessService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPagos();
    this.setupObservables();
  }

  private loadPagos(): void {
    this.pagosService.loadAll().subscribe({
      next: (pagos) => {
        this.totalPagos = pagos.length;
        this.extractEmpresaOptions(pagos);
        // Aplicar filtros iniciales después de cargar
        this.filteredPagos = this.applyFilters(pagos);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error cargando pagos:', error);
        this.msg.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los pagos. Verifica que el JSON Server esté corriendo en el puerto 3001.'
        });
      }
    });
  }

  private setupObservables(): void {
    this.pagos$ = this.pagosService.getPaymentsObservable().pipe(
      map((list) => {
        this.filteredPagos = this.applyFilters(list);
        return this.filteredPagos;
      })
    );
  }

  private extractEmpresaOptions(pagos: Pago[]): void {
    const empresas = [...new Set(pagos.map(p => p.empresa))];
    this.empresaOptions = empresas.map(empresa => ({
      label: empresa,
      value: empresa
    }));
  }

  applyFilters(list: Pago[]): Pago[] {
    return list.filter((p) => {
      // Filtro por estados
      if (this.selectedEstados.length && !this.selectedEstados.includes(p.estadoPago)) {
        return false;
      }
      
      // Filtro por empresa
      if (this.selectedEmpresa && p.empresa !== this.selectedEmpresa) {
        return false;
      }
      
      // Filtro por fechas
      if (this.dateFrom && p.fecha < this.dateFrom) return false;
      if (this.dateTo && p.fecha > this.dateTo) return false;
      
      return true;
    });
  }

  onGlobalFilter(event: any): void {
    this.globalFilter = event.target.value;
    this.table.filterGlobal(this.globalFilter, 'contains');
  }

  onFilterChange(): void {
    this.pagosService.getPaymentsObservable().subscribe(pagos => {
      this.filteredPagos = this.applyFilters(pagos);
      this.first = 0; // Reset to first page when filtering
      this.cdr.detectChanges();
    });
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
    this.cdr.detectChanges();
  }

  onDateRangeChange(): void {
    if (this.dateRange && this.dateRange.length === 2) {
      this.dateFrom = this.dateRange[0].toISOString().split('T')[0];
      this.dateTo = this.dateRange[1].toISOString().split('T')[0];
    } else {
      this.dateFrom = undefined;
      this.dateTo = undefined;
    }
    this.onFilterChange();
  }

  clearFilters(): void {
    this.globalFilter = '';
    this.selectedEstados = [];
    this.selectedEmpresa = null;
    this.dateFrom = undefined;
    this.dateTo = undefined;
    this.dateRange = [];
    this.first = 0; // Reset pagination

    // Limpiar filtros de la tabla
    this.table.clear();

    // Recargar datos sin filtros
    this.onFilterChange();
  }

  exportFiltered(): void {
    if (this.filteredPagos.length === 0) {
      this.msg.add({
        severity: 'warn',
        summary: 'Sin datos',
        detail: 'No hay pagos para exportar'
      });
      return;
    }
    
    this.pagosService.exportToCSV(this.filteredPagos, `pagos_export_${new Date().toISOString().split('T')[0]}.csv`);
    this.msg.add({
      severity: 'success',
      summary: 'Exportado',
      detail: `${this.filteredPagos.length} pagos exportados correctamente`
    });
  }

  getEstadoBadgeClass(estado: string): string {
    const baseClasses = 'inline-flex px-2 py-1 text-xs font-semibold rounded-full';
    
    switch (estado) {
      case 'PENDIENTE':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'AUTORIZADO':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'PAGADO':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  getTotalValue(): number {
    return this.filteredPagos.reduce((total, pago) => total + pago.valorOperacion, 0);
  }

  createPago(): void {
    this.router.navigate(['/pagos/form'], { queryParams: { mode: 'create' } });
  }

  viewPago(pago: Pago): void {
    this.router.navigate(['/pagos/form'], { queryParams: { id: pago.id, mode: 'view' } });
  }

  editPago(pago: Pago): void {
    this.router.navigate(['/pagos/form'], { queryParams: { id: pago.id, mode: 'edit' } });
  }

  deletePago(pago: Pago): void {
    this.confirm.confirm({
      message: `¿Estás seguro de que deseas eliminar el pago ${pago.id}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.pagosService.delete(pago.id).subscribe({
          next: () => {
            this.msg.add({
              severity: 'success',
              summary: 'Eliminado',
              detail: `Pago ${pago.id} eliminado correctamente`
            });
            this.onFilterChange();
          },
          error: () => {
            this.msg.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el pago'
            });
          }
        });
      }
    });
  }

  trackById(index: number, item: Pago): string {
    return item.id;
  }

  onColumnFilter(event: any, field: string): void {
    const value = (event.target as HTMLInputElement).value;
    this.table.filter(value, field, 'contains');
  }

  onDropdownFilter(event: any, field: string): void {
    const value = event.value;
    this.table.filter(value, field, 'equals');
  }

  onDateFilter(event: any): void {
    if (event) {
      // Convertir la fecha a formato YYYY-MM-DD para comparación
      const dateStr = event.toISOString().split('T')[0];
      this.table.filter(dateStr, 'fecha', 'equals');
    } else {
      // Si se limpia la fecha, quitar el filtro
      this.table.filter(null, 'fecha', 'equals');
    }
  }
}