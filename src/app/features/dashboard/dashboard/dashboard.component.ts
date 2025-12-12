import { Component, OnInit } from '@angular/core';
import {
  NgIf,
  NgFor,
  DecimalPipe,
  DatePipe,
  TitleCasePipe,
  UpperCasePipe,
} from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import {
    Chart,
  ChartConfiguration,
  ChartOptions,
  ChartType,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  BarController,
  DoughnutController,
} from 'chart.js';

import {
  DashboardService,
  DashboardSummary,
} from '../../../core/services/dashboard.service';
import { DealStage } from '../../../core/services/deals.service';
// Registro necesario para Chart.js v3/v4 (escala category, barras y doughnut)
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  BarController,
  DoughnutController,
  Tooltip,
  Legend,
);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    DecimalPipe,
    DatePipe,
    TitleCasePipe,
    UpperCasePipe,
    BaseChartDirective,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class Dashboard implements OnInit {
  isLoading = false;
  error: string | null = null;

  summary: DashboardSummary | null = null;

  // derivados
  totalDeals = 0;
  stagesOrder: DealStage[] = [
    'prospecting',
    'qualified',
    'proposal',
    'won',
    'lost',
  ];
  // 🎨 Colores por etapa
  private stageColors: Record<DealStage, string> = {
    prospecting: '#3b82f6', // azul
    qualified:   '#6366f1', // índigo
    proposal:    '#8b5cf6', // violeta
    won:         '#22c55e', // verde
    lost:        '#f97316', // naranja
  };

  // podrías usarlo para filtrar por usuario en un futuro
  ownerUserId?: number;
  daysAhead = 7;

  // 📊 CONFIG GRÁFICO DE BARRAS (pipeline € por etapa)
  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value = ctx.parsed.y ?? 0;
            return ` ${value.toLocaleString()} €`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#e5e7eb' },
      },
    },
  };

  barChartLabels: string[] = [];
  barChartType: 'bar' = 'bar';
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
      },
    ],
  };

  // 🍩 CONFIG GRÁFICO DOUGHNUT (nº deals por etapa)
 
  doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const label = ctx.label || '';
            const value = ctx.parsed ?? 0;
            return ` ${label}: ${value}`;
          },
        },
      },
    },
  };

  doughnutChartLabels: string[] = [];
  doughnutChartType: 'doughnut' = 'doughnut';
  doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
      },
    ],
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    this.isLoading = true;
    this.error = null;

    this.dashboardService
      .getSummary(this.ownerUserId, this.daysAhead)
      .subscribe({
        next: (data) => {
          this.summary = data;
          this.isLoading = false;
          this.computeDerived();
        },
        error: () => {
          this.error = 'Error loading dashboard data';
          this.isLoading = false;
        },
      });
  }
  private computeDerived(): void {
    if (!this.summary) {
      this.totalDeals = 0;

      this.barChartLabels = [];
      this.barChartData = {
        labels: [],
        datasets: [{ data: [] }],
      };

      this.doughnutChartLabels = [];
      this.doughnutChartData = {
        labels: [],
        datasets: [{ data: [] }],
      };

      return;
    }

    // total deals
    this.totalDeals = this.summary.deals_by_stage.reduce(
      (acc, s) => acc + s.count,
      0
    );

    // ordenar etapas según stagesOrder
    const map = new Map(
      this.summary.deals_by_stage.map((s) => [s.stage, s])
    );

    const ordered = this.stagesOrder
      .map((key) => map.get(key))
      .filter((v): v is NonNullable<typeof v> => !!v);

    // labels
    this.barChartLabels = ordered.map((s) => s.stage);
    this.doughnutChartLabels = this.barChartLabels;

    // datos
    const pipelineValues = ordered.map((s) => s.total_amount);
    const dealCounts = ordered.map((s) => s.count);

    // 🎨 colores por etapa (en el mismo orden)
    const colors = ordered.map((s) => this.stageColors[s.stage as DealStage]);

    // 📊 BARRAS: pipeline €
    this.barChartData = {
      labels: this.barChartLabels,
      datasets: [
        {
          data: pipelineValues,
          backgroundColor: colors,
          hoverBackgroundColor: colors,
          borderRadius: 8,
          maxBarThickness: 40,
        },
      ],
    };

    // 🍩 DOUGHNUT: nº de deals
    this.doughnutChartData = {
      labels: this.doughnutChartLabels,
      datasets: [
        {
          data: dealCounts,
          backgroundColor: colors,
          hoverBackgroundColor: colors,
          borderWidth: 1,
          hoverOffset: 6,
        },
      ],
    };
  }


  get sortedStages() {
    if (!this.summary) return [];
    const map = new Map(
      this.summary.deals_by_stage.map((s) => [s.stage, s])
    );
    return this.stagesOrder
      .map((key) => map.get(key))
      .filter((v): v is NonNullable<typeof v> => !!v);
  }

  get upcomingActivities() {
    return this.summary?.upcoming_activities ?? [];
  }

  refresh(): void {
    this.loadSummary();
  }
}
