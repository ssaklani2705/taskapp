import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import Swal from 'sweetalert2';

import { environment } from '../../../../environments/environment';
import { DataProviderService } from '../../../service/data-provider.service';

interface MailLog {
  name: string;
  email: string;
  subject: string;
  mailDate: any;
  ipAddress: string;
  localIp: string;
  status: string;
  mailBody?: string;
}

@Component({
  selector: 'app-mail-log-report',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
  ],
  providers: [DatePipe],
  templateUrl: './mail-log-report.html',
  styleUrl: './mail-log-report.scss',
})
export class MailLogReportComponent implements OnInit {

  // ================= DATA =================
  mailLogs: MailLog[] = [];
  apiResponse: any = {};

  // ================= SEARCH =================
  searchQuery = '';
  search = '';

  // ================= PAGINATION =================
  currentPage = 1;
  page = 0;
  size: number = environment.size;
  recordsPerPage: number = environment.recordsPerPage;

  constructor(
    private dataprovider: DataProviderService,
    private router: Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.currentPage = +(params['currentPage'] || 1);
      this.page = +(params['page'] || this.currentPage - 1);
      this.size = +(params['size'] || environment.size);
      this.searchQuery = params['searchText'] || '';
      this.search = this.searchQuery;
      this.recordsPerPage = this.size;

      this.getMailLogDetails();
    });
  }

  // ================= API =================
  getMailLogDetails(): void {
    this.dataprovider
      .getMailLogDetails(this.page, this.size, this.search)
      .subscribe({
        next: (response) => {
          this.apiResponse = response;
          this.mailLogs = response.data || [];
        },
        error: (error) => {
          console.error('Error fetching mail log report:', error);
        },
      });
  }

  // ================= DATE FORMAT =================
  // Output: 01 Sep 2026 17:46
  formatDateTime(value: any): string {
    if (!value) {
      return '';
    }

    // Already formatted by backend -> show as is
    if (typeof value === 'string' && /^\d{2} [A-Za-z]{3} \d{4}/.test(value)) {
      return value;
    }

    return this.datePipe.transform(value, 'dd MMM yyyy HH:mm') || '';
  }

  // ================= STATUS CLASS =================
  getStatusClass(status: string): string {
    const s = (status || '').toLowerCase();

    if (s === 'sent') {
      return 'status-sent';
    }
    if (s === 'failed' || s === 'error') {
      return 'status-failed';
    }
    return 'status-other';
  }

  // ================= VIEW MAIL =================
  viewMail(log: MailLog): void {
    Swal.fire({
      title: log.subject || 'Mail',
      html: `
        <div class="mail-meta">
          <div><strong>To:</strong> <span id="mail-to"></span></div>
          <div><strong>Date:</strong> <span id="mail-date"></span></div>
        </div>
        <iframe id="mail-frame" sandbox=""
          style="width:100%;height:320px;border:1px solid #d5dee7;margin-top:10px;background:#fff;">
        </iframe>
      `,
      width: 720,
      confirmButtonText: 'Close',
      didOpen: () => {
        // Set content via DOM properties (not string interpolation) to avoid HTML injection
        const to = document.getElementById('mail-to');
        const date = document.getElementById('mail-date');
        const frame = document.getElementById('mail-frame') as HTMLIFrameElement;

        if (to) {
          to.textContent = `${log.name || ''} <${log.email || ''}>`;
        }
        if (date) {
          date.textContent = this.formatDateTime(log.mailDate);
        }
        if (frame) {
          frame.srcdoc = log.mailBody || '<p>No mail content available.</p>';
        }
      },
    });
  }

  // ================= PAGINATION =================
  get paginatedLogs(): MailLog[] {
    return this.mailLogs;
  }

  goToPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages) {
      return;
    }

    this.currentPage = pageNumber;
    this.page = pageNumber - 1;

    this.router
      .navigate(['/mail-log-report'], {
        queryParams: {
          currentPage: this.currentPage,
          searchText: this.search || '',
          page: this.page,
          size: this.size || 10,
        },
      })
      .then(() => this.getMailLogDetails());
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

  // ================= SEARCH =================
  onSearch(): void {
    this.search = this.searchQuery.trim();
    this.currentPage = 1;
    this.page = 0;

    this.router.navigate(['/mail-log-report'], {
      queryParams: {
        currentPage: this.currentPage,
        searchText: this.search,
        page: this.page,
        size: this.size,
      },
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.onSearch();
  }

  // ================= SUMMARY =================
  get totalRecords(): number {
    return this.apiResponse?.totalElements || 0;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalRecords / this.recordsPerPage));
  }

  get recordSummary(): string {
    const total = this.totalRecords;

    const startRecord =
      total === 0 ? 0 : (this.currentPage - 1) * this.recordsPerPage + 1;

    const endRecord = Math.min(this.currentPage * this.recordsPerPage, total);

    return `Page ${this.currentPage} of ${this.totalPages}, (${startRecord} - ${endRecord} of ${total} record${total > 1 ? 's' : ''})`;
  }
}