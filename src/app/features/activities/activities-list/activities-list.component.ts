import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DatePipe, TitleCasePipe } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import {
  ActivitiesService,
  Activity,
  ActivityDetail,
  ActivityType,
} from "../../../core/services/activies.service"

type SortField = 'due_date' | 'type' | 'subject';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-activities-list',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, DatePipe, TitleCasePipe],
  templateUrl: './activities-list.component.html',
  styleUrls: ['./activities-list.component.scss'],
})
export class ActivitiesListComponent implements OnInit {
  activities: Activity[] = [];
  isLoading = false;
  error: string | null = null;

  // filtros
  typeFilter = '';
  ownerFilter: number | null = null;
  dealFilter: number | null = null;
  dueFromFilter = '';
  dueToFilter = '';

  // paginación
  page = 1;
  pageSize = 20;
  isLastPage = false;

  // orden
  sortField: SortField = 'due_date';
  sortDirection: SortDirection = 'asc';

  // creación
  showCreateForm = false;
  createForm!: FormGroup;
  isSaving = false;

  // detalle
  selectedActivity: ActivityDetail | null = null;
  detailLoading = false;

  activityTypes: ActivityType[] = ['call', 'email', 'meeting', 'task'];

  constructor(
    private activitiesService: ActivitiesService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.createForm = this.fb.group({
      type: ['call', Validators.required],
      subject: ['', Validators.required],
      notes: [''],
      due_date: [''], // datetime-local string
      deal_id: [null],
      contact_id: [null],
      owner_user_id: [1],
    });

    this.loadActivities();
  }

  private loadActivities(): void {
    this.isLoading = true;
    this.error = null;

    this.activitiesService
      .getActivities(
        this.typeFilter || undefined,
        this.ownerFilter || undefined,
        this.dealFilter || undefined,
        this.dueFromFilter || undefined,
        this.dueToFilter || undefined,
        this.page,
        this.pageSize
      )
      .subscribe({
        next: (data) => {
          this.activities = data;
          this.isLoading = false;
          this.isLastPage = data.length < this.pageSize;
        },
        error: () => {
          this.isLoading = false;
          this.error = 'Error loading activities';
        },
      });
  }

  // 🔍 filtros
  onTypeChange(value: string): void {
    this.typeFilter = value;
    this.resetToFirstPage();
    this.loadActivities();
  }

  onOwnerChange(val: string): void {
    const num = val ? Number(val) : null;
    this.ownerFilter = Number.isNaN(num) ? null : num;
    this.resetToFirstPage();
    this.loadActivities();
  }

  onDealChange(val: string): void {
    const num = val ? Number(val) : null;
    this.dealFilter = Number.isNaN(num) ? null : num;
    this.resetToFirstPage();
    this.loadActivities();
  }

  onDueFromChange(val: string): void {
    this.dueFromFilter = val;
    this.resetToFirstPage();
    this.loadActivities();
  }

  onDueToChange(val: string): void {
    this.dueToFilter = val;
    this.resetToFirstPage();
    this.loadActivities();
  }

  clearFilters(): void {
    this.typeFilter = '';
    this.ownerFilter = null;
    this.dealFilter = null;
    this.dueFromFilter = '';
    this.dueToFilter = '';
    this.resetToFirstPage();
    this.loadActivities();
  }

  private resetToFirstPage(): void {
    this.page = 1;
    this.isLastPage = false;
  }

  // ⏭ paginación
  nextPage(): void {
    if (this.isLastPage) return;
    this.page++;
    this.loadActivities();
  }

  prevPage(): void {
    if (this.page === 1) return;
    this.page--;
    this.loadActivities();
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

  get sortedActivities(): Activity[] {
    const data = [...this.activities];

    return data.sort((a, b) => {
      const av = (a[this.sortField] || '').toString().toLowerCase();
      const bv = (b[this.sortField] || '').toString().toLowerCase();

      if (av < bv) return this.sortDirection === 'asc' ? -1 : 1;
      if (av > bv) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // 🟢 crear actividad
  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.createForm.reset({
        type: 'call',
        owner_user_id: 1,
      });
    }
  }

  submitActivity(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.error = null;

    this.activitiesService.createActivity(this.createForm.value).subscribe({
      next: () => {
        this.isSaving = false;
        this.showCreateForm = false;
        this.createForm.reset({
          type: 'call',
          owner_user_id: 1,
        });
        this.resetToFirstPage();
        this.loadActivities();
      },
      error: () => {
        this.isSaving = false;
        this.error = 'Error creating activity';
      },
    });
  }

  // 🔍 detalle
  selectActivity(a: Activity): void {
    // toggle: si ya está seleccionada, colapsa
    if (this.selectedActivity && this.selectedActivity.id === a.id) {
      this.selectedActivity = null;
      return;
    }

    this.detailLoading = true;
    this.activitiesService.getActivityDetail(a.id).subscribe({
      next: (detail) => {
        this.selectedActivity = detail;
        this.detailLoading = false;
      },
      error: () => {
        this.detailLoading = false;
      },
    });
  }
}
