// src/app/features/companies/companies-list/companies-list.component.ts
import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf ,DecimalPipe} from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  CompaniesService,
  Company,
  CompanyDetail,
} from '../../../core/services/companies.service';

type SortField = 'name' | 'industry' | 'city' | 'created_at';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-companies-list',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule,DecimalPipe],
  templateUrl: './companies-list.component.html',
  styleUrls: ['./companies-list.component.scss'],
})
export class CompaniesListComponent implements OnInit {
  companies: Company[] = [];
  isLoading = false;
  error: string | null = null;

  // filtros
  searchTerm = '';
  cityFilter = '';
  industryFilter = '';

  // paginación
  page = 1;
  pageSize = 10;
  isLastPage = false;

  // orden
  sortField: SortField = 'name';
  sortDirection: SortDirection = 'asc';

  // creación
  showCreateForm = false;
  createForm!: FormGroup;
  isSaving = false;

  // detalle / tarjeta
  selectedCompanyDetail: CompanyDetail | null = null;
  detailLoading = false;

  constructor(
    private companiesService: CompaniesService,
    private fb: FormBuilder
  ) {
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      industry: [''],
      city: [''],
      country: [''],
      website: [''],
      phone: [''],
      address: [''],
    });
  }

  ngOnInit(): void {
    this.loadCompanies();
  }

  private loadCompanies(): void {
    this.isLoading = true;
    this.error = null;

    const search = this.searchTerm.trim() || undefined;
    const city = this.cityFilter.trim() || undefined;
    const industry = this.industryFilter.trim() || undefined;

    this.companiesService
      .getCompanies(search, city, industry, this.page, this.pageSize)
      .subscribe({
        next: (data) => {
          this.companies = data;
          this.isLoading = false;
          // si trae menos que pageSize, asumimos que es la última página
          this.isLastPage = data.length < this.pageSize;

          // si la compañía seleccionada ya no está en esta página, limpiamos el detalle
          if (
            this.selectedCompanyDetail &&
            !this.companies.some(
              (c) => c.id === this.selectedCompanyDetail?.id
            )
          ) {
            this.selectedCompanyDetail = null;
          }
        },
        error: () => {
          this.error = 'Error loading companies';
          this.isLoading = false;
        },
      });
  }

  // 🔍 filtros
  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.resetToFirstPage();
    this.loadCompanies();
  }

  onCityChange(value: string): void {
    this.cityFilter = value;
    this.resetToFirstPage();
    this.loadCompanies();
  }

  onIndustryChange(value: string): void {
    this.industryFilter = value;
    this.resetToFirstPage();
    this.loadCompanies();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.cityFilter = '';
    this.industryFilter = '';
    this.resetToFirstPage();
    this.loadCompanies();
  }

  private resetToFirstPage(): void {
    this.page = 1;
    this.isLastPage = false;
  }

  // ⏭ paginación
  nextPage(): void {
    if (this.isLastPage) return;
    this.page++;
    this.loadCompanies();
  }

  prevPage(): void {
    if (this.page === 1) return;
    this.page--;
    this.loadCompanies();
  }

  // ↕ orden
  changeSort(field: SortField): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

  get sortedCompanies(): Company[] {
    const data = [...this.companies];

    return data.sort((a, b) => {
      const field = this.sortField;

      const av = (a[field] || '') as string;
      const bv = (b[field] || '') as string;

      const aVal = av.toString().toLowerCase();
      const bVal = bv.toString().toLowerCase();

      if (aVal < bVal) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aVal > bVal) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // 🟢 crear compañía
  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.createForm.reset();
    }
  }

  submitCompany(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.error = null;

    this.companiesService.createCompany(this.createForm.value).subscribe({
      next: () => {
        this.isSaving = false;
        this.showCreateForm = false;
        this.createForm.reset();
        this.resetToFirstPage();
        this.loadCompanies();
        // si quisieras, aquí podríamos pedir el detalle de la creada,
        // pero de momento lo dejamos simple
      },
      error: () => {
        this.isSaving = false;
        this.error = 'Error creating company';
      },
    });
  }

  // 🔍 seleccionar compañía para mostrar tarjeta con detalle
  selectCompany(company: Company): void {
    // toggle: si ya está seleccionada, la quitamos
    if (this.selectedCompanyDetail && this.selectedCompanyDetail.id === company.id) {
      this.selectedCompanyDetail = null;
      return;
    }

    this.detailLoading = true;

    this.companiesService.getCompanyDetail(company.id).subscribe({
      next: (detail) => {
        this.selectedCompanyDetail = detail;
        this.detailLoading = false;
      },
      error: () => {
        this.detailLoading = false;
        // aquí podrías añadir un mensaje de error específico si quieres
      },
    });
  }
}
