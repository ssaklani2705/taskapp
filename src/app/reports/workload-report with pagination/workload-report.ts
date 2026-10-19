import {
  Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Chart, registerables } from 'chart.js';
import { DataProviderService, DepartmentDTO, TaskCategoryDTO } from '../../service/data-provider.service';

Chart.register(...registerables);

@Component({
  selector: 'app-workload-report',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatDividerModule, MatDatepickerModule],
  providers: [provideNativeDateAdapter()],           // remove if your app already provides a date adapter
  templateUrl: './workload-report.html',
  styleUrl: './workload-report.scss',
})
export class WorkloadReport implements OnInit, OnDestroy {
  @ViewChild('statusCanvas') statusCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('hoursCanvas') hoursCanvas?: ElementRef<HTMLCanvasElement>;

  viewMode: 'table' | 'graph' = 'table';

  fromDate: Date | null = null;
  toDate: Date | null = null;
  searchQuery = '';

  allRows: any[] = [];
  filteredRows: any[] = [];

  loading = false;
  errorMessage = '';

  currentPage = 1;
  recordsPerPage = 10;     // table view
  graphPageSize = 15;      // graph view (users per page)

  private statusChart?: Chart;
  private hoursChart?: Chart;

  departmentList: DepartmentDTO[] = [];
categoryList: TaskCategoryDTO[] = [];

selectedDepartmentIds: number[] = [];     // empty = All
selectedCategoryIds: number[] = [];       // empty = All

showDepartmentDropdown = false;
showCategoryDropdown = false;

@ViewChild('departmentDropdown') departmentDropdown?: ElementRef;
@ViewChild('categoryDropdown') categoryDropdown?: ElementRef;

  constructor(
    private reportService: DataProviderService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngOnInit(): void {
    this.setDefaultDates();
    this.loadDepartments();
    this.loadReport();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  // ---------- department / category filters ----------

private loadDepartments(): void {
  this.reportService.getActiveDepartments().subscribe({
    next: (res: DepartmentDTO[]) => {
      this.departmentList = res || [];
      this.loadCategories();
    },
    error: () => { this.departmentList = []; this.categoryList = []; },
  });
}

private loadCategories(): void {
  const ids = this.selectedDepartmentIds.length
    ? this.selectedDepartmentIds
    : this.departmentList.map(d => d.departmentId);

  if (!ids.length) {
    this.categoryList = [];
    this.selectedCategoryIds = [];
    return;
  }

  this.reportService.getCategoriesByDepartmentIds(ids).subscribe({
    next: (res: TaskCategoryDTO[]) => {
      this.categoryList = res || [];
      const valid = this.categoryList.map(c => c.taskcategoryId);
      // drop selected categories that no longer belong to the chosen departments
      this.selectedCategoryIds = this.selectedCategoryIds.filter(id => valid.includes(id));
    },
    error: () => { this.categoryList = []; this.selectedCategoryIds = []; },
  });
}

toggleDepartment(id: number, event: Event): void {
  const checked = (event.target as HTMLInputElement).checked;
  this.selectedDepartmentIds = checked
    ? [...this.selectedDepartmentIds, id]
    : this.selectedDepartmentIds.filter(x => x !== id);
  this.loadCategories();
}

toggleCategory(id: number, event: Event): void {
  const checked = (event.target as HTMLInputElement).checked;
  this.selectedCategoryIds = checked
    ? [...this.selectedCategoryIds, id]
    : this.selectedCategoryIds.filter(x => x !== id);
}

isDepartmentChecked(id: number): boolean { return this.selectedDepartmentIds.includes(id); }
isCategoryChecked(id: number): boolean { return this.selectedCategoryIds.includes(id); }

getSelectedDepartmentNames(): string {
  return this.departmentList
    .filter(d => this.selectedDepartmentIds.includes(d.departmentId))
    .map(d => d.name).join(', ');
}

getSelectedCategoryNames(): string {
  return this.categoryList
    .filter(c => this.selectedCategoryIds.includes(c.taskcategoryId))
    .map(c => c.name).join(', ');
}

@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent): void {
  const target = event.target as Node;
  if (this.showDepartmentDropdown && this.departmentDropdown &&
      !this.departmentDropdown.nativeElement.contains(target)) {
    this.showDepartmentDropdown = false;
  }
  if (this.showCategoryDropdown && this.categoryDropdown &&
      !this.categoryDropdown.nativeElement.contains(target)) {
    this.showCategoryDropdown = false;
  }
}

  // ---------- view switch ----------

  setView(mode: 'table' | 'graph'): void {
    this.viewMode = mode;
    this.currentPage = 1;
    if (mode === 'graph') {
      setTimeout(() => this.renderCharts());   // wait until the canvases exist
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

    this.reportService.getWorkload(this.toIso(this.fromDate), this.toIso(this.toDate),this.selectedDepartmentIds,
    this.selectedCategoryIds,).subscribe({
      next: res => {
        this.allRows = res.data || [];
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load the report.';
        this.allRows = [];
        this.filteredRows = [];
        this.loading = false;
        this.destroyCharts();
      },
    });
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
    this.setDefaultDates();
    this.loadCategories();
    this.loadReport();
  }

  private applyFilter(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.filteredRows = q
      ? this.allRows.filter(r => (r.userName || '').toLowerCase().includes(q))
      : [...this.allRows];
    this.currentPage = 1;
    if (this.viewMode === 'graph') {
      setTimeout(() => this.renderCharts());
    }
  }

  // ---------- pagination (table and graph views) ----------

  get pageSize(): number {
    return this.viewMode === 'graph' ? this.graphPageSize : this.recordsPerPage;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredRows.length / this.pageSize));
  }

  get paginatedRows(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRows.slice(start, start + this.pageSize);
  }

  get recordSummary(): string {
    const total = this.filteredRows.length;
    if (total === 0) return 'No records found';
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, total);
    return `Showing ${start} to ${end} of ${total} records`;
  }

  pages(): number[] {
    const windowSize = 5;
    let start = Math.max(1, this.currentPage - Math.floor(windowSize / 2));
    const end = Math.min(this.totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    const list: number[] = [];
    for (let p = start; p <= end; p++) list.push(p);
    return list;
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    if (this.viewMode === 'graph') {
      setTimeout(() => this.renderCharts());   // redraw the charts for the new page
    }
  }
  goToFirstPage(): void { this.goToPage(1); }
  goToLastPage(): void { this.goToPage(this.totalPages); }

  // ---------- load bar (table view) ----------

  get maxOpenHours(): number {
    return Math.max(1, ...this.filteredRows.map(r => Number(r.openHours) || 0));
  }

  barWidth(r: any): number {
    return Math.round(((Number(r.openHours) || 0) / this.maxOpenHours) * 100);
  }

  // ---------- graphs ----------

  get chartHeight(): number {
    return Math.max(260, this.paginatedRows.length * 42 + 90);
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

    const rows = this.paginatedRows;                    // current page only
    if (!this.statusCanvas || !this.hoursCanvas || !rows.length) return;

    const labels = rows.map(r => r.userName);
    const values = (key: string) => rows.map(r => Number(r[key]) || 0);

    this.statusChart = new Chart(this.statusCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Open', data: values('openTasks'), backgroundColor: '#2f6fa3', stack: 'status' },
          { label: 'Pending review', data: values('pendingReview'), backgroundColor: '#f0b429', stack: 'status' },
          { label: 'Completed', data: values('completedTasks'), backgroundColor: '#287d5e', stack: 'status' },
          { label: 'Overdue', data: values('overdueTasks'), backgroundColor: '#b8403d', stack: 'overdue' },
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
        plugins: { legend: { position: 'bottom' } },
      },
    });

    this.hoursChart = new Chart(this.hoursCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Open hours', data: values('openHours'), backgroundColor: '#19345a' },
        ],
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
}