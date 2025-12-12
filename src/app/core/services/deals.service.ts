import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type DealStage = 'prospecting' | 'qualified' | 'proposal' | 'won' | 'lost';

export interface Deal {
  id: number;
  title: string;
  amount: number;
  currency: string;
  stage: DealStage;
  close_date?: string | null;
  company_id: number;
  contact_id?: number | null;
  owner_user_id?: number | null;

  company_name?: string | null;
  contact_name?: string | null;

  created_at?: string;
  updated_at?: string;
}
export type DealDetail = Deal;

export interface DealCreate {
  title: string;
  amount: number;
  currency?: string;
  stage: DealStage;
  close_date?: string | null;
  company_id: number;
  contact_id?: number | null;
  owner_user_id?: number | null;
}

export interface DealUpdate {
  title?: string;
  amount?: number;
  currency?: string;
  stage?: DealStage;
  close_date?: string | null;
  company_id?: number;
  contact_id?: number | null;
  owner_user_id?: number | null;
}
export interface DealActivity {
  id: number;
  type: 'call' | 'email' | 'meeting' | 'task' | string;
  subject: string;
  due_date?: string | null;
  contact_name?: string | null;
  deal_title?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class DealsService {
  private apiUrl = 'http://127.0.0.1:8000/deals';

  constructor(private http: HttpClient) {}

  getDeals(
    stage?: DealStage,
    companyId?: number,
    ownerUserId?: number,
    page: number = 1,
    pageSize: number = 20
  ): Observable<Deal[]> {
    let params = new HttpParams();
    const skip = (page - 1) * pageSize;

    params = params.set('skip', skip.toString());
    params = params.set('limit', pageSize.toString());

    if (stage) {
      params = params.set('stage', stage);
    }

    if (companyId) {
      params = params.set('company_id', companyId.toString());
    }

    if (ownerUserId) {
      params = params.set('owner_user_id', ownerUserId.toString());
    }

    return this.http.get<Deal[]>(this.apiUrl, { params });
  }

  getDeal(id: number): Observable<Deal> {
    return this.http.get<Deal>(`${this.apiUrl}/${id}`);
  }

  createDeal(payload: DealCreate): Observable<Deal> {
    return this.http.post<Deal>(this.apiUrl, payload);
  }

  updateDeal(id: number, payload: DealUpdate): Observable<Deal> {
    return this.http.patch<Deal>(`${this.apiUrl}/${id}`, payload);
  }

  updateDealStage(id: number, stage: DealStage): Observable<Deal> {
    const params = new HttpParams().set('stage', stage);
    return this.http.patch<Deal>(`${this.apiUrl}/${id}/stage`, null, { params });
  }

  deleteDeal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
    getDealActivities(dealId: number): Observable<DealActivity[]> {
    return this.http.get<DealActivity[]>(`${this.apiUrl}/${dealId}/activities`);
  }

}
