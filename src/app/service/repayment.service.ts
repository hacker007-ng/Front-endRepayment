import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Repayment, TableRepayment } from '../models/repayment.model';

@Injectable({
  providedIn: 'root',
})
export class RepaymentService {
  private apiUrl = 'http://localhost:4000/api/repayments'; 

  constructor(private http: HttpClient) {}


  getRepaymentSchedule(userId: string): Observable<TableRepayment[]> {
    return this.http.get<TableRepayment[]>(`${this.apiUrl}/schedule/${userId}`);
  }

  makePayment(userId: string, repaymentId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/payment/${userId}/${repaymentId}`, {}).pipe(
      catchError((error) => {
        console.error('Error making payment:', error);
        return throwError(error);
      })
    );
  }

  getOutstandingBalance(userId: string): Observable<{ outstandingBalance: number }> {
    return this.http.get<{ outstandingBalance: number }>(`${this.apiUrl}/balance/${userId}`);
  }
 
}