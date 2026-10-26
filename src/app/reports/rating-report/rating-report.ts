import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import moment, { Moment } from 'moment';
import { DataProviderService } from '../../service/data-provider.service';
import { environment } from '../../../environments/environment';
import { SESSION_KEYS } from '../../service/session-storage.keys';
import { SessionStorageService } from '../../service/session-storage.service';
import * as XLSX from 'xlsx';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface UserAccessLog {
  name: string;
  totalTasks: number;
  ratedTasks: number;
  avgRating: number | null;
}

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-rating-report',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatDividerModule, MatDatepickerModule],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    {
      provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS,
      useValue: { useUtc: false },
    },
  ],
  templateUrl: './rating-report.html',
  styleUrl: './rating-report.scss',
})
export class RatingReport implements OnInit {
  fromDate: Moment | null = null;
  toDate: Moment | null = null;

  searchQuery = '';
  search = '';

  currentPage = 1;
  page = 0;
  size: number = environment.size;
  recordsPerPage: number = environment.recordsPerPage;

  apiResponse: any = {};
  accessLogs: UserAccessLog[] = [];

  filterKey = SESSION_KEYS.RATING_REPORT_FILTER;

  constructor(
    private reportService: DataProviderService,
    private sessionService: SessionStorageService,
  ) {}

  ngOnInit(): void {
    this.sessionService.clearOtherSessions(this.filterKey);

    const filterState = this.sessionService.getItem(this.filterKey);

    if (filterState) {
      this.currentPage = filterState.currentPage ?? 1;
      this.page = filterState.page ?? this.currentPage - 1;
      this.size = filterState.size ?? environment.size;
      this.recordsPerPage = this.size;

      this.search = filterState.searchText ?? '';
      this.searchQuery = this.search;

      this.fromDate = filterState.fromDate ? moment(filterState.fromDate, 'YYYY-MM-DD', true) : null;

      this.toDate = filterState.toDate ? moment(filterState.toDate, 'YYYY-MM-DD', true) : null;
    }

    this.getRatingDetails();
  }

  private formatDate(date: Moment | null): string | null {
    if (!date || !date.isValid()) {
      return null;
    }

    return date.format('YYYY-MM-DD');
  }

  getRatingDetails(): void {
    const fromDate = this.formatDate(this.fromDate);
    const toDate = this.formatDate(this.toDate);

    this.reportService.getTaskRatingSummary(fromDate, toDate, this.search, this.page, this.size).subscribe({
      next: (response) => {
        this.apiResponse = response;
        this.accessLogs = response?.content ?? [];

        this.currentPage = this.page + 1;
        this.recordsPerPage = this.size;
      },
      error: (error) => {
        console.error('Error fetching task rating summary:', error);
        this.apiResponse = {};
        this.accessLogs = [];
      },
    });
  }

  onSearch(): void {
    this.search = this.searchQuery.trim();
    this.currentPage = 1;
    this.page = 0;

    this.saveFilterState();
    this.getRatingDetails();
  }

  clearFilters(): void {
    this.fromDate = null;
    this.toDate = null;
    this.searchQuery = '';
    this.search = '';

    this.currentPage = 1;
    this.page = 0;

    this.saveFilterState();
    this.getRatingDetails();
  }

  saveFilterState(): void {
    const filterState = {
      currentPage: this.currentPage,
      searchText: this.search,
      fromDate: this.formatDate(this.fromDate),
      toDate: this.formatDate(this.toDate),
      page: this.page,
      size: this.size,
    };

    this.sessionService.setItem(this.filterKey, filterState);
  }

  goToPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages) {
      return;
    }

    this.currentPage = pageNumber;
    this.page = pageNumber - 1;

    this.saveFilterState();
    this.getRatingDetails();
  }

  goToFirstPage(): void {
    this.goToPage(1);
  }

  goToLastPage(): void {
    this.goToPage(this.totalPages);
  }

  pages(): number[] {
    const delta = 5;
    const start = Math.max(1, this.currentPage - delta);
    const end = Math.min(this.totalPages, this.currentPage + delta);

    const result: number[] = [];

    for (let i = start; i <= end; i++) {
      result.push(i);
    }

    return result;
  }

  get totalRecords(): number {
    return this.apiResponse?.totalElements ?? 0;
  }

  get totalPages(): number {
    return Math.max(1, this.apiResponse?.totalPages ?? Math.ceil(this.totalRecords / this.recordsPerPage));
  }

  get recordSummary(): string {
    const total = this.totalRecords;

    const startRecord = total === 0 ? 0 : (this.currentPage - 1) * this.recordsPerPage + 1;

    const endRecord = Math.min(this.currentPage * this.recordsPerPage, total);

    return `Page ${this.currentPage} of ${this.totalPages}, (${startRecord} - ${endRecord} of ${total} record${total !== 1 ? 's' : ''})`;
  }

  get paginatedLogs(): UserAccessLog[] {
    return this.accessLogs;
  }

  exportingExcel = false;
  exportToExcel(): void {
  if (this.exportingExcel) {
    return;
  }

  this.exportingExcel = true;

  const fromDate = this.formatDate(this.fromDate);
  const toDate = this.formatDate(this.toDate);

  // Fetch page 0 first to determine the total number of pages.
  this.reportService
    .getTaskRatingSummary(fromDate, toDate, this.search, 0, this.size)
    .subscribe({
      next: (response: any) => {
        const totalPages = response?.totalPages ?? 0;
        const firstPageData: UserAccessLog[] = response?.content ?? [];

        if (totalPages <= 1) {
          this.downloadExcel(firstPageData);
          return;
        }

        // Fetch every remaining page using the same filters.
        const requests: Observable<any>[] = [];

        for (let pageIndex = 1; pageIndex < totalPages; pageIndex++) {
          requests.push(
            this.reportService.getTaskRatingSummary(
              fromDate,
              toDate,
              this.search,
              pageIndex,
              this.size
            )
          );
        }

        forkJoin(requests).subscribe({
          next: (responses: any[]) => {
            const allRows = [
              ...firstPageData,
              ...responses.flatMap(
                (pageResponse) => pageResponse?.content ?? []
              ),
            ];

            this.downloadExcel(allRows);
          },
          error: (error) => {
            console.error('Error exporting rating report:', error);
            alert('Unable to export the rating report. Please try again.');
            this.exportingExcel = false;
          },
        });
      },
      error: (error) => {
        console.error('Error fetching rating report for export:', error);
        alert('Unable to export the rating report. Please try again.');
        this.exportingExcel = false;
      },
    });
}

private downloadExcel(data: UserAccessLog[]): void {
  try {
    const rows = data.map((log, index) => ({
      'Sr. No.': index + 1,
      'User Name': log.name ?? '',
      'Total Task': log.totalTasks ?? 0,
      'Rated Task': log.ratedTasks ?? 0,
      'Average Rating': log.avgRating ?? 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);

    worksheet['!cols'] = [
      { wch: 10 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 18 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rating Report');

    const filename = `Rating_Report_${moment().format('YYYYMMDD_HHmmss')}.xlsx`;

    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error('Error creating Excel file:', error);
    alert('Unable to create the Excel file. Please try again.');
  } finally {
    this.exportingExcel = false;
  }
}
}
