import { Component, OnInit } from '@angular/core';
import {
  NgFor,
  NgIf,
  DecimalPipe,
  SlicePipe,
  TitleCasePipe,
} from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import {
  DealsService,
  Deal,
  DealDetail,
  DealStage,
} from '../../../core/services/deals.service';
import {
  ActivitiesService,
  Activity,
} from '../../../core/services/activies.service';

type SortField = 'title' | 'stage' | 'amount' | 'close_date';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-deals-list',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    ReactiveFormsModule,
    DecimalPipe,
    SlicePipe,
    TitleCasePipe,
  ],
  templateUrl: './deals-list.component.html',
  styleUrls: ['./deals-list.component.scss'],
})
export class DealsListComponent implements OnInit {
  deals: Deal[] = [];
  isLoading = false;
  error: string | null = null;

  // 🔍 filtros
  stageFilter: DealStage | undefined = undefined;
  companyFilter: number | null = null;
  ownerFilter: number | null = null;

  // paginación
  page = 1;
  pageSize = 20;
  isLastPage = false;

  // orden
  sortField: SortField = 'title';
  sortDirection: SortDirection = 'asc';

  // creación
  showCreateForm = false;
  createForm!: FormGroup;
  isSaving = false;

  // detalle deal
  selectedDeal: DealDetail | null = null;
  detailLoading = false;

  // timeline de actividades del deal
  timeline: Activity[] = [];
  timelineLoading = false;

  // usamos el tipo fuerte también aquí
  stages: DealStage[] = ['prospecting', 'qualified', 'proposal', 'won', 'lost'];

  // datos agregados para el pipeline visual
  pipelineColumns: {
    stage: string;
    count: number;
    totalAmount: number;
    deals: Deal[];
  }[] = [];

  constructor(
    private dealsService: DealsService,
    private activitiesService: ActivitiesService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.createForm = this.fb.group({
      title: ['', Validators.required],
      amount: [0, [Validators.required]],
      currency: ['EUR', Validators.required],
      stage: ['prospecting', Validators.required],
      close_date: [''],
      company_id: [null, Validators.required],
      contact_id: [null],
      owner_user_id: [1],
    });

    this.loadDeals();
  }

  // 🟣 Cargar deals
  private loadDeals(): void {
    this.isLoading = true;
    this.error = null;

    const companyId = this.companyFilter ?? undefined;
    const ownerId = this.ownerFilter ?? undefined;

    this.dealsService
      .getDeals(
        this.stageFilter, // 👈 ya es DealStage | undefined
        companyId,
        ownerId,
        this.page,
        this.pageSize
      )
      .subscribe({
        next: (data) => {
          this.deals = data;
          this.isLoading = false;
          this.isLastPage = data.length < this.pageSize;
          this.buildPipelineColumns();
        },
        error: () => {
          this.error = 'Error loading deals';
          this.isLoading = false;
        },
      });
  }

  private buildPipelineColumns(): void {
    const byStage: Record<string, { deals: Deal[]; totalAmount: number }> = {};

    for (const s of this.stages) {
      byStage[s] = { deals: [], totalAmount: 0 };
    }

    for (const d of this.deals) {
      const stage = d.stage || 'prospecting';
      if (!byStage[stage]) {
        byStage[stage] = { deals: [], totalAmount: 0 };
      }
      byStage[stage].deals.push(d);
      const amount = Number(d.amount || 0);
      byStage[stage].totalAmount += isNaN(amount) ? 0 : amount;
    }

    this.pipelineColumns = this.stages.map((s) => ({
      stage: s,
      count: byStage[s].deals.length,
      totalAmount: byStage[s].totalAmount,
      deals: byStage[s].deals,
    }));
  }

  // 🔍 filtros
  onStageChange(value: string): void {
    this.stageFilter = value ? (value as DealStage) : undefined;
    this.resetToFirstPage();
    this.loadDeals();
  }

  onCompanyFilterChange(value: string): void {
    const num = value ? Number(value) : null;
    this.companyFilter = Number.isNaN(num) ? null : num;
    this.resetToFirstPage();
    this.loadDeals();
  }

  onOwnerFilterChange(value: string): void {
    const num = value ? Number(value) : null;
    this.ownerFilter = Number.isNaN(num) ? null : num;
    this.resetToFirstPage();
    this.loadDeals();
  }

  clearFilters(): void {
    this.stageFilter = undefined;   // 👈 ya no string
    this.companyFilter = null;
    this.ownerFilter = null;
    this.resetToFirstPage();
    this.loadDeals();
  }

  private resetToFirstPage(): void {
    this.page = 1;
    this.isLastPage = false;
  }

  // ⏭ paginación
  nextPage(): void {
    if (this.isLastPage) return;
    this.page++;
    this.loadDeals();
  }

  prevPage(): void {
    if (this.page === 1) return;
    this.page--;
    this.loadDeals();
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

  get sortedDeals(): Deal[] {
    const data = [...this.deals];

    return data.sort((a, b) => {
      const av = (a[this.sortField] || '').toString().toLowerCase();
      const bv = (b[this.sortField] || '').toString().toLowerCase();

      if (av < bv) return this.sortDirection === 'asc' ? -1 : 1;
      if (av > bv) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // 🟢 crear deal
  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.createForm.reset({
        currency: 'EUR',
        stage: 'prospecting',
        owner_user_id: 1,
      });
    }
  }

  submitDeal(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.error = null;

    this.dealsService.createDeal(this.createForm.value).subscribe({
      next: () => {
        this.isSaving = false;
        this.showCreateForm = false;
        this.createForm.reset({
          currency: 'EUR',
          stage: 'prospecting',
          owner_user_id: 1,
        });
        this.resetToFirstPage();
        this.loadDeals();
      },
      error: () => {
        this.isSaving = false;
        this.error = 'Error creating deal';
      },
    });
  }

  // 🔍 seleccionar deal + cargar timeline
  selectDeal(d: Deal): void {
    // toggle: si es el mismo, cerramos detalle
    if (this.selectedDeal && this.selectedDeal.id === d.id) {
      this.selectedDeal = null;
      this.timeline = [];
      return;
    }

    this.detailLoading = true;
    this.timeline = [];

    this.dealsService.getDeal(d.id).subscribe({
      next: (detail) => {
        this.selectedDeal = detail;
        this.detailLoading = false;
        this.loadTimeline(detail.id);
      },
      error: () => {
        this.detailLoading = false;
      },
    });
  }

  private loadTimeline(dealId: number): void {
    this.timelineLoading = true;
    this.timeline = [];

    this.activitiesService
      .getActivities(
        undefined,      // type
        undefined,      // owner_user_id
        dealId,         // deal_id
        undefined,      // due_from
        undefined,      // due_to
        1,              // page
        20              // pageSize
      )
      .subscribe({
        next: (activities) => {
          this.timeline = activities;
          this.timelineLoading = false;
        },
        error: () => {
          this.timelineLoading = false;
        },
      });
  }

  // ⏫ cambio de etapa desde el detalle
  updateStage(newStage: string): void {
    if (!this.selectedDeal) return;
    if (newStage === this.selectedDeal.stage) return;

    const stage = newStage as DealStage;

    this.dealsService.updateDealStage(this.selectedDeal.id, stage).subscribe({
      next: (updated) => {
        // actualizar detalle
        this.selectedDeal = { ...this.selectedDeal!, stage: updated.stage };

        // actualizar lista
        this.deals = this.deals.map((d) =>
          d.id === updated.id ? { ...d, stage: updated.stage } : d
        );

        // reconstruir pipeline
        this.buildPipelineColumns();
      },
      error: () => {
        // aquí podrías mostrar un mensaje de error si quieres
      },
    });
  }
}
