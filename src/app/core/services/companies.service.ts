import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Company {
  id: number;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  created_at?: string;
}
export interface ContactSummary {
  id: number;
  first_name: string;
  last_name: string;
  job_title?: string;
  email?: string;
  phone?: string;
}

export interface DealSummary {
  id: number;
  title: string;
  stage: string;
  amount: number;
  close_date?: string;
}

export interface ActivitySummary {
  id: number;
  type: string;
  subject: string;
  due_date?: string;
  contact_name?: string;
  deal_title?: string;
}

export interface CompanyDetail extends Company {
  contacts: ContactSummary[];
  deals: DealSummary[];
  activities: ActivitySummary[];
}

@Injectable({
  providedIn: 'root',
})
export class CompaniesService {
  private apiUrl = 'http://127.0.0.1:8000/companies';

  constructor(private http: HttpClient) {}

    getCompanies(
    search?: string,
    city?: string,
    industry?: string,
    page: number = 1,
    pageSize: number = 10
  ): Observable<Company[]> {
    let params = new HttpParams();

    const skip = (page - 1) * pageSize;
    params = params.set('skip', skip.toString());
    params = params.set('limit', pageSize.toString());

    if (search) {
      params = params.set('search', search);
    }
    if (city) {
      params = params.set('city', city);
    }
    if (industry) {
      params = params.set('industry', industry);
    }

    return this.http.get<Company[]>(this.apiUrl, { params });
  }
    createCompany(payload: Partial<Company>): Observable<Company> {
    return this.http.post<Company>(this.apiUrl, payload);
  }
  
  // ⬇️ NUEVO: detalle con contactos, deals y actividades
  getCompanyDetail(id: number): Observable<CompanyDetail> {
    return this.http.get<CompanyDetail>(`${this.apiUrl}/${id}/detail`);
  }
}
