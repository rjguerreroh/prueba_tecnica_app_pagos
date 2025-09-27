import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { Pago } from '../../models/pago.model';
import { PagosService } from '../../services/pagos.service';
import { AccessService } from '../../services/access.service';

@Component({
  selector: 'app-pago-form',
  templateUrl: './pago-form.component.html'
})
export class PagoFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Modo del formulario
  mode: 'create' | 'edit' | 'view' = 'create';
  pagoId?: string;
  pago?: Pago;
  
  // Formulario reactivo
  form: FormGroup;
  
  // Archivos adjuntos
  facturaFile?: File;
  soporteFile?: File;
  
  // Opciones para dropdowns
  estadoOptions = [
    { label: 'PENDIENTE', value: 'PENDIENTE' },
    { label: 'AUTORIZADO', value: 'AUTORIZADO' },
    { label: 'PAGADO', value: 'PAGADO' }
  ];
  
  formaPagoOptions = [
    { label: 'TRANSFERENCIA', value: 'TRANSFERENCIA' },
    { label: 'TARJETA', value: 'TARJETA' },
    { label: 'EFECTIVO', value: 'EFECTIVO' },
    { label: 'CHEQUE', value: 'CHEQUE' }
  ];
  
  empresaOptions = [
    { label: 'SESPA', value: 'SESPA' },
    { label: 'Bavaria', value: 'Bavaria' },
    { label: 'Ecopetrol', value: 'Ecopetrol' },
    { label: 'Alpina', value: 'Alpina' },
    { label: 'Nutresa', value: 'Nutresa' },
    { label: 'Postobón', value: 'Postobón' }
  ];
  
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

  constructor(
    private fb: FormBuilder,
    private pagosService: PagosService,
    private msg: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    public access: AccessService
  ) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.mode = params['mode'] || 'create';
      this.pagoId = params['id'];
      
      if (this.pagoId) {
        this.loadPago();
      } else {
        this.initializeNewPago();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      id: [''],
      fecha: ['', Validators.required],
      empresa: ['', Validators.required],
      areaOperacion: [''],
      rubro: [''],
      tercero: ['', [Validators.required, Validators.minLength(3)]],
      valorOperacion: [0, [Validators.required, Validators.min(1)]],
      estadoPago: ['PENDIENTE', Validators.required],
      ingresoOGasto: ['GASTO'],
      formaPago: ['TRANSFERENCIA'],
      tienePresupuesto: [false],
      facturaUrl: [null],
      soporteUrl: [null]
    });
  }

  private loadPago(): void {
    if (!this.pagoId) return;
    
    this.pagosService.getPaymentsObservable().pipe(
      takeUntil(this.destroy$)
    ).subscribe(pagos => {
      this.pago = pagos.find(p => p.id === this.pagoId);
      if (this.pago) {
        // Preparar datos para el formulario, convirtiendo fecha string a Date
        const formData = { ...this.pago };
        if (formData.fecha && typeof formData.fecha === 'string') {
          formData.fecha = new Date(formData.fecha) as any;
        }
        
        this.form.patchValue(formData);
        if (this.mode === 'view') {
          this.form.disable();
        }
      }
    });
  }

  private initializeNewPago(): void {
    // Generar nuevo ID
    const newId = 'P-' + String(Math.floor(Math.random() * 9000 + 1000)).padStart(4, '0');
    this.form.get('id')?.setValue(newId);
    
    // Establecer fecha actual como objeto Date
    const today = new Date();
    this.form.get('fecha')?.setValue(today);
  }

  onFileFactura(event: any): void {
    const file = event.files?.[0];
    if (file) {
      this.facturaFile = file;
      this.form.get('facturaUrl')?.setValue(file.name);
    }
  }

  onFileSoporte(event: any): void {
    const file = event.files?.[0];
    if (file) {
      this.soporteFile = file;
      this.form.get('soporteUrl')?.setValue(file.name);
    }
  }

  openFileDialog(type: 'factura' | 'soporte'): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = (event: any) => {
      const file = event.target.files?.[0];
      if (file) {
        if (type === 'factura') {
          this.facturaFile = file;
          this.form.get('facturaUrl')?.setValue(file.name);
        } else {
          this.soporteFile = file;
          this.form.get('soporteUrl')?.setValue(file.name);
        }
      }
    };
    input.click();
  }

  save(): void {
    if (this.form.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formData = this.form.value;
    
    // Asegurar que la fecha se guarde como string ISO
    if (formData.fecha instanceof Date) {
      formData.fecha = formData.fecha.toISOString().split('T')[0];
    }
    
    // Agregar trazabilidad
    const trazabilidad = this.pago?.trazabilidad || [];
    trazabilidad.push({
      usuario: 'mockUser',
      fecha: new Date().toISOString(),
      nota: this.mode === 'create' ? 'Creado' : 'Editado'
    });

    const pagoData: Pago = {
      ...formData,
      trazabilidad
    };

    if (this.mode === 'create') {
      this.pagosService.create(pagoData).subscribe({
        next: () => {
          this.msg.add({
            severity: 'success',
            summary: 'Guardado',
            detail: 'Pago creado correctamente'
          });
          this.router.navigate(['/pagos']);
        },
        error: () => {
          this.msg.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear el pago'
          });
        }
      });
    } else if (this.mode === 'edit') {
      this.pagosService.update(pagoData.id, pagoData).subscribe({
        next: () => {
          this.msg.add({
            severity: 'success',
            summary: 'Guardado',
            detail: 'Pago actualizado correctamente'
          });
          this.router.navigate(['/pagos']);
        },
        error: () => {
          this.msg.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el pago'
          });
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/pagos']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }

  get isFormValid(): boolean {
    return this.form.valid;
  }

  get isReadOnly(): boolean {
    return this.mode === 'view';
  }

  get formTitle(): string {
    switch (this.mode) {
      case 'create': return 'Crear Nuevo Pago';
      case 'edit': return 'Editar Pago';
      case 'view': return 'Ver Detalles del Pago';
      default: return 'Formulario de Pago';
    }
  }
}
