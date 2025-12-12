import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  position?: string | null;
  company_id?: number | null;
  company_name?: string | null;
  owner_user_id?: number | null;
  tags?: any[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface ContactCreate {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  position?: string;
  company_id?: number;
  owner_user_id?: number;
  tags?: any[];
}
export interface DealSummary {
  id: number;
  title: string;
  stage: string;
  amount: number;
  close_date?: string | null;
}

export interface ActivitySummary {
  id: number;
  type: string;
  subject: string;
  due_date?: string | null;
  contact_name?: string | null;
  deal_title?: string | null;
}

export interface ContactDetail extends Contact {
  company_industry?: string | null;
  deals: DealSummary[];
  activities: ActivitySummary[];
}
@Injectable({
  providedIn: 'root',
})
export class ContactsService {
  private apiUrl = 'http://127.0.0.1:8000/contacts';

  constructor(private http: HttpClient) {}

  getContacts(
    search?: string,
    company_id?: number,
    page: number = 1,
    pageSize: number = 20
  ): Observable<Contact[]> {
    let params = new HttpParams();
    const skip = (page - 1) * pageSize;

    params = params.set('skip', skip.toString());
    params = params.set('limit', pageSize.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    if (company_id) {
      params = params.set('company_id', company_id.toString());
    }

    return this.http.get<Contact[]>(this.apiUrl, { params });
  }

  createContact(payload: ContactCreate): Observable<Contact> {
    return this.http.post<Contact>(this.apiUrl, payload);
  }

  getContact(id: number): Observable<Contact> {
    return this.http.get<Contact>(`${this.apiUrl}/${id}`);
  }

  updateContact(id: number, payload: Partial<ContactCreate>): Observable<Contact> {
    return this.http.patch<Contact>(`${this.apiUrl}/${id}`, payload);
  }

  deleteContact(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  getContactDetail(id: number): Observable<ContactDetail> {
  return this.http.get<ContactDetail>(`${this.apiUrl}/${id}/detail`);
}

}
