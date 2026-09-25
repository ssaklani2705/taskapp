import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { DataProviderService } from '../../../service/data-provider.service';
import { SESSION_KEYS } from '../../../service/session-storage.keys';
import { SessionStorageService } from '../../../service/session-storage.service';

interface UserAccessLog {
  userName: string;
  ipAddress: string;
  loginTime: any;
  logoutTime: any;
}

@Component({
  selector: 'app-access-report',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
  ],
  providers: [DatePipe],
  templateUrl: './access-report.html',
  styleUrl: './access-report.scss',
})
export class AccessReportComponent implements OnInit {
  accessLogs: UserAccessLog[] = [];
  apiResponse: any = {};

  searchQuery = '';
  search = '';

  currentPage = 1;
  page = 0;
  size: number = environment.size;
  recordsPerPage: number = environment.recordsPerPage;

  isPanelVisible = true;

  filterKey = SESSION_KEYS.ACCESS_REPORT_FILTER;

  constructor(
    private dataprovider: DataProviderService,
    private datePipe: DatePipe,
    private sessionService: SessionStorageService,
  ) {}

  // ngOnInit(): void {
  //   this.route.queryParams.subscribe((params) => {
  //     this.currentPage = +(params['currentPage'] || 1);
  //     this.page = +(params['page'] || this.currentPage - 1);
  //     this.size = +(params['size'] || environment.size);
  //     this.searchQuery = params['searchText'] || '';
  //     this.search = this.searchQuery;
  //     this.recordsPerPage = this.size;

  //     this.getUserAccessDetails();
  //   });
  // }

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
    }

    this.getUserAccessDetails();
  }

  saveFilterState(): void {
    const filterState = {
      currentPage: this.currentPage,
      searchText: this.search.trim(),
      page: this.page,
      size: this.size,
    };

    this.sessionService.setItem(this.filterKey, filterState);
  }

  togglePanel(): void {
    this.isPanelVisible = !this.isPanelVisible;
  }

  getUserAccessDetails(): void {
    this.dataprovider.getUserAccessDetails(this.page, this.size, this.search).subscribe({
      next: (response) => {
        this.apiResponse = response;
        this.accessLogs = response.data || [];
      },
      error: (error) => {
        console.error('Error fetching access report:', error);
      },
    });
  }

  formatDateTime(value: any): string {
    if (!value) {
      return '';
    }

    if (typeof value === 'string' && /^\d{2}-\d{2}-\d{4}/.test(value)) {
      return value;
    }

    return this.datePipe.transform(value, 'dd-MM-yyyy hh:mm a') || '';
  }

  get paginatedLogs(): UserAccessLog[] {
    return this.accessLogs;
  }

  goToPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages) {
      return;
    }

    this.currentPage = pageNumber;
    this.page = pageNumber - 1;

    // this.router
    //   .navigate(['/access-report'], {
    //     queryParams: {
    //       currentPage: this.currentPage,
    //       searchText: this.search || '',
    //       page: this.page,
    //       size: this.size || 10,
    //     },
    //   })
    //   .then(() => this.getUserAccessDetails());

    this.saveFilterState();
    this.getUserAccessDetails();
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

    const arr: number[] = [];
    for (let i = start; i <= end; i++) {
      arr.push(i);
    }
    return arr;
  }

  onSearch(): void {
    this.search = this.searchQuery.trim();
    this.currentPage = 1;
    this.page = 0;

    // this.router.navigate(['/access-report'], {
    //   queryParams: {
    //     currentPage: this.currentPage,
    //     searchText: this.search,
    //     page: this.page,
    //     size: this.size,
    //   },
    // });

    this.saveFilterState();
    this.getUserAccessDetails();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.onSearch();
  }

  get totalRecords(): number {
    return this.apiResponse?.totalElements || 0;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalRecords / this.recordsPerPage));
  }

  get recordSummary(): string {
    const total = this.totalRecords;

    const startRecord = total === 0 ? 0 : (this.currentPage - 1) * this.recordsPerPage + 1;
    const endRecord = Math.min(this.currentPage * this.recordsPerPage, total);

    return `Page ${this.currentPage} of ${this.totalPages}, (${startRecord} - ${endRecord} of ${total} record${total > 1 ? 's' : ''})`;
  }
}
