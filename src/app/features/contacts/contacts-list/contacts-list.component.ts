import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';

import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import {
  ContactsService,
  Contact,
  ContactCreate,
  ContactDetail,
} from '../../../core/services/contact.service';

type SortField = 'first_name' | 'last_name' | 'email' | 'created_at';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-contacts-list',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, DecimalPipe],
  templateUrl: './contacts-list.component.html',
  styleUrls: ['./contacts-list.component.scss'],
})
export class ContactsList implements OnInit {
  contacts: Contact[] = [];
  isLoading = false;
  error: string | null = null;

  // filtros
  searchTerm = '';
  companyFilter: number | null = null;

  // paginación
  page = 1;
  pageSize = 20;
  isLastPage = false;

  // orden
  sortField: SortField = 'first_name';
  sortDirection: SortDirection = 'asc';

  // creación
  showCreateForm = false;
  createForm!: FormGroup;
  isSaving = false;
 // detalle / tarjeta
  selectedContactDetail: ContactDetail | null = null;
  detailLoading = false;


  constructor(
    private contactsService: ContactsService,
    private fb: FormBuilder
  ) {
    this.createForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: [''],
      phone: [''],
      position: [''],
      company_id: [null],
    });
  }

  ngOnInit(): void {
    this.loadContacts();
  }

  private loadContacts(): void {
    this.isLoading = true;
    this.error = null;

    const search = this.searchTerm.trim() || undefined;
    const company_id = this.companyFilter || undefined;

    this.contactsService
      .getContacts(search, company_id, this.page, this.pageSize)
      .subscribe({
        next: (data) => {
          this.contacts = data;
          this.isLoading = false;
          this.isLastPage = data.length < this.pageSize;
        },
        error: () => {
          this.error = 'Error loading contacts';
          this.isLoading = false;
        },
      });
  }

  // filtros
  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.resetToFirstPage();
    this.loadContacts();
  }

  onCompanyFilterChange(value: string): void {
    const parsed = parseInt(value, 10);
    this.companyFilter = isNaN(parsed) ? null : parsed;
    this.resetToFirstPage();
    this.loadContacts();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.companyFilter = null;
    this.resetToFirstPage();
    this.loadContacts();
  }

  private resetToFirstPage(): void {
    this.page = 1;
    this.isLastPage = false;
  }

  // paginación
  nextPage(): void {
    if (this.isLastPage) return;
    this.page++;
    this.loadContacts();
  }

  prevPage(): void {
    if (this.page === 1) return;
    this.page--;
    this.loadContacts();
  }

  // orden
  changeSort(field: SortField): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

  get sortedContacts(): Contact[] {
    const data = [...this.contacts];

    return data.sort((a, b) => {
      const field = this.sortField;

      const av = (a[field] || '') as string;
      const bv = (b[field] || '') as string;

      const aVal = av?.toString().toLowerCase() || '';
      const bVal = bv?.toString().toLowerCase() || '';

      if (aVal < bVal) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aVal > bVal) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // crear contacto
  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.createForm.reset();
    }
  }

  submitContact(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.error = null;

    const payload: ContactCreate = this.createForm.value;

    this.contactsService.createContact(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.showCreateForm = false;
        this.createForm.reset();
        this.resetToFirstPage();
        this.loadContacts();
      },
      error: () => {
        this.isSaving = false;
        this.error = 'Error creating contact';
      },
    });
  }
  selectContact(contact: Contact): void {
  // toggle: si ya está seleccionada, la cerramos
  if (
    this.selectedContactDetail &&
    this.selectedContactDetail.id === contact.id
  ) {
    this.selectedContactDetail = null;
    return;
  }

  this.detailLoading = true;

  this.contactsService.getContactDetail(contact.id).subscribe({
    next: (detail) => {
      this.selectedContactDetail = detail;
      this.detailLoading = false;
    },
    error: () => {
      this.detailLoading = false;
      // opcional: podrías setear this.errorDetalle
    },
    });   
  }
}