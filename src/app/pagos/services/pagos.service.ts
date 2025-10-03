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
        console.error('Error al cargar pagos:', err);
        return throwError(() => err);
      })
    );
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
