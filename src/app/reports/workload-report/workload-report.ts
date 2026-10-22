import { Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Chart, registerables } from 'chart.js';
import { DataProviderService, DepartmentDTO, TaskCategoryDTO } from '../../service/data-provider.service';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
Chart.register(...registerables);
export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD-MM-YYYY',
  },
  display: {
    dateInput: 'DD-MM-YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD-MM-YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
@Component({
  selector: 'app-workload-report',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatDividerModule, MatDatepickerModule],
   providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    {
      provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS,
      useValue: { useUtc: false }
    }
  ], // remove if your app already provides a date adapter
  templateUrl: './workload-report.html',
  styleUrl: './workload-report.scss',
})
export class WorkloadReport implements OnInit, OnDestroy {
  @ViewChild('statusCanvas') statusCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('hoursCanvas') hoursCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('departmentDropdown') departmentDropdown?: ElementRef;
  @ViewChild('categoryDropdown') categoryDropdown?: ElementRef;

  viewMode: 'table' | 'graph' = 'table';

  fromDate: Date | null = null;
  toDate: Date | null = null;
  searchQuery = '';

  allRows: any[] = [];
  filteredRows: any[] = [];

  loading = false;
  errorMessage = '';
  hasSearched = false; // false = blank state (nothing loaded yet)

  // ---------- department / category filters ----------
  departmentList: DepartmentDTO[] = [];
  categoryList: TaskCategoryDTO[] = [];

  selectedDepartmentIds: number[] = []; // report needs at least one department
  selectedCategoryIds: number[] = []; // empty = all categories of the selected departments

  showDepartmentDropdown = false;
  showCategoryDropdown = false;

  private statusChart?: Chart;
  private hoursChart?: Chart;

  constructor(
    private reportService: DataProviderService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngOnInit(): void {
    this.setDefaultDates();
    this.loadDepartments(); // report stays blank until a department is selected and Go is clicked
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  // ---------- department / category filters ----------

  private readonly sortOpts = { numeric: true, sensitivity: 'base' } as const;

  private loadDepartments(): void {
    this.reportService.getActiveDepartments().subscribe({
      next: (res: DepartmentDTO[]) => {
        this.departmentList = [...(res || [])].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', undefined, this.sortOpts));
        this.loadCategories();
      },
      error: () => {
        this.departmentList = [];
        this.categoryList = [];
      },
    });
  }

  // Department name A-Z, then category name A-Z within each department
  private sortCategories(list: TaskCategoryDTO[]): TaskCategoryDTO[] {
    // Use the DTO's departmentName if it has one, otherwise look the department up by id
    const deptName = (c: any): string => c.departmentName ?? this.departmentList.find((d) => d.departmentId === c.departmentId)?.name ?? '';

    return [...list].sort((a: any, b: any) => deptName(a).localeCompare(deptName(b), undefined, this.sortOpts) || String(a.name ?? '').localeCompare(String(b.name ?? ''), undefined, this.sortOpts));
  }
  private categoryReq = 0;

 private loadCategories(onLoaded?: () => void): void {
  const ids = this.selectedDepartmentIds.length
    ? this.selectedDepartmentIds
    : this.departmentList.map((d) => d.departmentId);

  if (!ids.length) {
    this.categoryList = [];
    this.selectedCategoryIds = [];
    onLoaded?.();
    return;
  }

  const req = ++this.categoryReq;

  this.reportService.getCategoriesByDepartmentIds(ids).subscribe({
    next: (res: TaskCategoryDTO[]) => {
      if (req !== this.categoryReq) return;      // a newer tick has replaced this request
      this.categoryList = this.sortCategories(res || []);
      const valid = this.categoryList.map((c) => c.taskcategoryId);
      this.selectedCategoryIds = this.selectedCategoryIds.filter((id) => valid.includes(id));
      onLoaded?.();
    },
    error: () => {
      if (req !== this.categoryReq) return;
      this.categoryList = [];
      this.selectedCategoryIds = [];
    },
  });
}

  

toggleDepartment(id: number, event: Event): void {
  const checked = (event.target as HTMLInputElement).checked;
  this.selectedDepartmentIds = checked
    ? [...this.selectedDepartmentIds, id]
    : this.selectedDepartmentIds.filter((x) => x !== id);

  if (!this.selectedDepartmentIds.length) {
    this.resetResults();                // nothing selected => blank
    this.loadCategories();
    return;
  }

  // refresh the category list first, then search with the right categories
  this.loadCategories(() => this.loadReport());
}

  toggleCategory(id: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedCategoryIds = checked ? [...this.selectedCategoryIds, id] : this.selectedCategoryIds.filter((x) => x !== id);
    
  }

  isDepartmentChecked(id: number): boolean {
    return this.selectedDepartmentIds.includes(id);
  }
  isCategoryChecked(id: number): boolean {
    return this.selectedCategoryIds.includes(id);
  }

  getSelectedDepartmentNames(): string {
    return this.departmentList
      .filter((d) => this.selectedDepartmentIds.includes(d.departmentId))
      .map((d) => d.name)
      .join(', ');
  }

  getSelectedCategoryNames(): string {
    return this.categoryList
      .filter((c) => this.selectedCategoryIds.includes(c.taskcategoryId))
      .map((c) => c.name)
      .join(', ');
  }

  // Categories to send: the selected ones, or every category of the selected departments
  private effectiveCategoryIds(): number[] {
    if (this.selectedCategoryIds.length) return this.selectedCategoryIds;
    const ids = this.categoryList.map((c) => c.taskcategoryId);
    return ids.length ? ids : [-1]; // department with no categories => no tasks
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;
    if (this.showDepartmentDropdown && this.departmentDropdown && !this.departmentDropdown.nativeElement.contains(target)) {
      this.showDepartmentDropdown = false;
    }
    if (this.showCategoryDropdown && this.categoryDropdown && !this.categoryDropdown.nativeElement.contains(target)) {
      this.showCategoryDropdown = false;
    }
  }

  // ---------- view switch ----------

  setView(mode: 'table' | 'graph'): void {
    this.viewMode = mode;
    if (mode === 'graph') {
      setTimeout(() => this.renderCharts()); // wait until the canvases exist
    } else {
      this.destroyCharts();
    }
  }

  // ---------- dates ----------

  private setDefaultDates(): void {
    const now = new Date();
    this.fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    this.toDate = now;
  }

  // Local date to yyyy-MM-dd (toISOString() would shift the day in India)
  private toIso(d: Date): string {
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  // ---------- load ----------

 loadReport(): void {
  if (!this.fromDate || !this.toDate) {
    this.errorMessage = 'Please select both dates.';
    return;
  }
  if (this.toDate < this.fromDate) {
    this.errorMessage = 'To Date cannot be before From Date.';
    return;
  }
  this.errorMessage = '';
  this.loading = true;

  this.reportService
    .getWorkload(
      this.toIso(this.fromDate),
      this.toIso(this.toDate),
      this.selectedDepartmentIds,
      this.selectedCategoryIds,
    )
    .subscribe({
      next: (res) => {
        this.allRows = res.data || [];
        this.hasSearched = true;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load the report.';
        this.resetResults();
        this.loading = false;
      },
    });
}

  private resetResults(): void {
    this.allRows = [];
    this.filteredRows = [];
    this.hasSearched = false;
    this.destroyCharts();
  }

  onSearch(): void {
    this.applyFilter();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedDepartmentIds = [];
    this.selectedCategoryIds = [];
    this.showDepartmentDropdown = false;
    this.showCategoryDropdown = false;
    this.errorMessage = '';
    this.setDefaultDates();
    this.loadCategories();
    this.resetResults();
  }

  private applyFilter(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.filteredRows = q ? this.allRows.filter((r) => (r.userName || '').toLowerCase().includes(q)) : [...this.allRows];
    if (this.viewMode === 'graph') {
      setTimeout(() => this.renderCharts());
    }
  }

  get recordSummary(): string {
    if (!this.hasSearched) return '';
    const total = this.filteredRows.length;
    return total === 0 ? 'No records found' : `Total ${total} record${total > 1 ? 's' : ''}`;
  }

  // ---------- load bar (table view) ----------

  get maxOpenHours(): number {
    return Math.max(1, ...this.filteredRows.map((r) => Number(r.openHours) || 0));
  }

  barWidth(r: any): number {
    return Math.round(((Number(r.openHours) || 0) / this.maxOpenHours) * 100);
  }

  // ---------- graphs ----------

  get chartHeight(): number {
    return Math.max(260, this.filteredRows.length * 42 + 90);
  }

  private destroyCharts(): void {
    this.statusChart?.destroy();
    this.hoursChart?.destroy();
    this.statusChart = undefined;
    this.hoursChart = undefined;
  }

  private renderCharts(): void {
    this.destroyCharts();
    if (!isPlatformBrowser(this.platformId) || this.viewMode !== 'graph') return;

    const rows = this.filteredRows;
    if (!this.statusCanvas || !this.hoursCanvas || !rows.length) return;

    const labels = rows.map((r) => r.userName);
    const values = (key: string) => rows.map((r) => Number(r[key]) || 0);

    this.statusChart = new Chart(this.statusCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Open', data: values('openTasks'), backgroundColor: '#2f6fa3', stack: 'status',borderRadius: 4  },
          { label: 'Pending review', data: values('pendingReview'), backgroundColor: '#f0b429', stack: 'status',borderRadius: 4   },
          { label: 'Completed', data: values('completedTasks'), backgroundColor: '#287d5e', stack: 'status',borderRadius: 4   },
          { label: 'Overdue', data: values('overdueTasks'), backgroundColor: '#b8403d', stack: 'overdue',borderRadius: 4   },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { stacked: true, beginAtZero: true, ticks: { precision: 0 }, title: { display: true, text: 'Tasks' } },
          y: { stacked: true },
        },
        // plugins: { legend: { position: 'bottom' } },
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } },
      },
    });

    this.hoursChart = new Chart(this.hoursCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Open hours', data: values('openHours'), backgroundColor: '#19345a' }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { beginAtZero: true, title: { display: true, text: 'Hours' } },
        },
        plugins: { legend: { display: false } },
      },
    });
  }

  // ---------- summary cards / footer ----------
get totals() {
  const sum = (key: string) =>
    this.filteredRows.reduce((s, r) => s + (Number(r[key]) || 0), 0);
  return {
    total: sum('totalTasks'),
    open: sum('openTasks'),
    pending: sum('pendingReview'),
    completed: sum('completedTasks'),
    overdue: sum('overdueTasks'),
    hours: sum('openHours'),
  };
}

initials(name: string): string {
  const parts = (name || '?').trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

loadLevel(r: any): string {
  const pct = this.barWidth(r);
  return pct >= 75 ? 'load-high' : pct >= 40 ? 'load-mid' : 'load-low';
}
}
