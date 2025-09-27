import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Pago } from '../models/pago.model';


@Injectable({ providedIn: 'root' })
export class PagosService {
  private baseUrl = 'http://localhost:3001/pagos';
  private pagos$ = new BehaviorSubject<Pago[]>([]);
  public loading$ = new BehaviorSubject<boolean>(false);
  constructor(private http: HttpClient) {}

  loadAll(): Observable<Pago[]> {
    this.loading$.next(true);
    return this.http.get<Pago[]>(this.baseUrl).pipe(
      tap(p => { this.pagos$.next(p); this.loading$.next(false); }),
      catchError(err => { 
        this.loading$.next(false); 
        console.warn('JSON Server no disponible, usando datos mock');
        // Fallback a datos mock si el servidor no está disponible
        const mockData = this.getMockData();
        this.pagos$.next(mockData);
        return of(mockData);
      })
    );
  }

  private getMockData(): Pago[] {
    return [
      {
        id: "P-0001",
        fecha: "2025-01-16",
        empresa: "Bavaria",
        areaOperacion: "OPERACIONES",
        rubro: "COMBUSTIBLES",
        tercero: "Insumos Delta SAS",
        valorOperacion: 4709999,
        estadoPago: "PENDIENTE",
        ingresoOGasto: "INGRESO",
        formaPago: "TARJETA",
        tienePresupuesto: false,
        facturaUrl: null,
        soporteUrl: null,
        trazabilidad: [
          {
            usuario: "finanzas01",
            fecha: "2025-01-16T16:00:00",
            nota: "Creado"
          }
        ]
      },
      {
        id: "P-0002",
        fecha: "2025-04-04",
        empresa: "SESPA",
        areaOperacion: "LOGÍSTICA",
        rubro: "COMBUSTIBLES",
        tercero: "Publicidad Global",
        valorOperacion: 790136,
        estadoPago: "PENDIENTE",
        ingresoOGasto: "INGRESO",
        formaPago: "EFECTIVO",
        tienePresupuesto: true,
        facturaUrl: null,
        soporteUrl: null,
        trazabilidad: [
          {
            usuario: "contabilidad",
            fecha: "2025-04-04T09:00:00",
            nota: "Revisado"
          }
        ]
      },
      {
        id: "P-0003",
        fecha: "2025-01-19",
        empresa: "SESPA",
        areaOperacion: "LOGÍSTICA",
        rubro: "COMBUSTIBLES",
        tercero: "Insumos Delta SAS",
        valorOperacion: 2033580,
        estadoPago: "AUTORIZADO",
        ingresoOGasto: "GASTO",
        formaPago: "CHEQUE",
        tienePresupuesto: true,
        facturaUrl: null,
        soporteUrl: null,
        trazabilidad: [
          {
            usuario: "finanzas01",
            fecha: "2025-01-19T11:00:00",
            nota: "Revisado"
          }
        ]
      },
      {
        id: "P-0004",
        fecha: "2025-06-20",
        empresa: "SESPA",
        areaOperacion: "VENTAS",
        rubro: "COMBUSTIBLES",
        tercero: "Proveedor XYZ Ltda.",
        valorOperacion: 1468570,
        estadoPago: "PAGADO",
        ingresoOGasto: "INGRESO",
        formaPago: "EFECTIVO",
        tienePresupuesto: false,
        facturaUrl: null,
        soporteUrl: null,
        trazabilidad: [
          {
            usuario: "mockUser",
            fecha: "2025-06-20T16:00:00",
            nota: "Creado"
          }
        ]
      },
      {
        id: "P-0005",
        fecha: "2025-04-07",
        empresa: "Ecopetrol",
        areaOperacion: "TRANSPORTES",
        rubro: "COMBUSTIBLES",
        tercero: "Tecnored SA",
        valorOperacion: 4413940,
        estadoPago: "PENDIENTE",
        ingresoOGasto: "GASTO",
        formaPago: "EFECTIVO",
        tienePresupuesto: false,
        facturaUrl: null,
        soporteUrl: null,
        trazabilidad: [
          {
            usuario: "mockUser",
            fecha: "2025-04-07T14:00:00",
            nota: "Creado"
          }
        ]
      }
    ];
  }

  getPaymentsObservable(): Observable<Pago[]> {
    return this.pagos$.asObservable();
  }

  create(p: Pago): Observable<Pago> {
    const payload = { ...p };
    payload.trazabilidad = payload.trazabilidad || [];
    payload.trazabilidad.push({ usuario: 'mockUser', fecha: new Date().toISOString(), nota: 'Creado' });
    return this.http.post<Pago>(this.baseUrl, payload).pipe(
      tap(n => this.pagos$.next([ ...this.pagos$.value, n ]))
    );
  }

  update(id: string, p: Partial<Pago>): Observable<Pago> {
    const patch = { ...p, trazabilidad: (p.trazabilidad || []).concat({ usuario:'mockUser', fecha:new Date().toISOString(), nota:'Editado' })};
    return this.http.patch<Pago>(`${this.baseUrl}/${id}`, patch).pipe(
      tap(updated => {
        const arr = this.pagos$.value.map(x => x.id === id ? { ...x, ...updated } : x);
        this.pagos$.next(arr);
      })
    );
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.pagos$.next(this.pagos$.value.filter(x => x.id !== id)))
    );
  }

  // Helper: export filtered to CSV (client-side)
  exportToCSV(pagos: Pago[], filename = 'pagos_export.csv') {
    const headers = ['id','fecha','empresa','areaOperacion','rubro','tercero','valorOperacion','estadoPago','formaPago'];
    const rows = pagos.map(p => headers.map(h => JSON.stringify((p as any)[h] ?? '')).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}
