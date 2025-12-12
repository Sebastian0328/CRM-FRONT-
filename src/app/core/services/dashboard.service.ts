import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DealStage } from './deals.service';

export interface DealStageStats {
  stage: DealStage;
  count: number;
  total_amount: number;
}

export interface UpcomingActivity {
  id: number;
  type: 'call' | 'email' | 'meeting' | 'task' | string;
  subject: string;
  due_date: string | null;
  deal_id: number | null;
  contact_id: number | null;
  company_id: number | null;
  contact_name: string | null;
}

export interface DashboardSummary {
  deals_by_stage: DealStageStats[];
  total_pipeline_value: number;
  upcoming_activities: UpcomingActivity[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = 'http://127.0.0.1:8000/dashboard/summary';

  constructor(private http: HttpClient) {}

  getSummary(
    ownerUserId?: number,
    daysAhead: number = 7
  ): Observable<DashboardSummary> {
    let params = new HttpParams().set('days_ahead', daysAhead.toString());

    if (ownerUserId) {
      params = params.set('owner_user_id', ownerUserId.toString());
    }

    return this.http.get<DashboardSummary>(this.apiUrl, { params });
  }
}
