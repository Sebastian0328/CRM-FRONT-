import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ActivityType = 'call' | 'email' | 'meeting' | 'task' | string;

export interface Activity {
  id: number;
  type: ActivityType;
  subject: string;
  notes?: string | null;
  due_date?: string | null;
  done: boolean;
  deal_id?: number | null;
  contact_id?: number | null;
  owner_user_id?: number | null;
  created_at: string;
   // 👇 nuevos
  contact_name?: string | null;
  deal_title?: string | null;
  company_name?: string | null;
}

export type ActivityDetail = Activity;

@Injectable({
  providedIn: 'root',
})
export class ActivitiesService {
  private apiUrl = 'http://127.0.0.1:8000/activities';

  constructor(private http: HttpClient) {}

  getActivities(
    type?: string,
    owner_user_id?: number,
    deal_id?: number,
    due_from?: string,
    due_to?: string,
    page: number = 1,
    pageSize: number = 20
  ): Observable<Activity[]> {
    let params = new HttpParams()
      .set('skip', ((page - 1) * pageSize).toString())
      .set('limit', pageSize.toString());

    if (type) params = params.set('type', type);
    if (owner_user_id) params = params.set('owner_user_id', owner_user_id.toString());
    if (deal_id) params = params.set('deal_id', deal_id.toString());
    if (due_from) params = params.set('due_from', due_from);
    if (due_to) params = params.set('due_to', due_to);

    return this.http.get<Activity[]>(this.apiUrl, { params });
  }

  getActivityDetail(id: number): Observable<ActivityDetail> {
    return this.http.get<ActivityDetail>(`${this.apiUrl}/${id}`);
  }

  createActivity(body: Partial<Activity>): Observable<Activity> {
    return this.http.post<Activity>(this.apiUrl, body);
  }

  updateActivity(id: number, body: Partial<Activity>): Observable<Activity> {
    return this.http.patch<Activity>(`${this.apiUrl}/${id}`, body);
  }

  deleteActivity(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

