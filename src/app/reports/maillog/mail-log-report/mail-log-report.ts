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
import { SESSION_KEYS } from '../../../service/session-storage.keys';
import { SessionStorageService } from '../../../service/session-storage.service';

interface MailLog {
  mailLogId: any;
  cc: any;
  name: string;
  to: string;
  subject: string;
  regDate: any;
  ipAddress: string;
  localIp: string;
  status: any;
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
  mailLogs: MailLog[] = [];
  apiResponse: any = {};

  searchQuery = '';
  search = '';

  currentPage = 1;
  page = 0;
  size: number = environment.size;
  recordsPerPage: number = environment.recordsPerPage;

  filterKey = SESSION_KEYS.MAIL_LOG_FILTER;

  constructor(
    private dataprovider: DataProviderService,
    private router: Router,
    private route: ActivatedRoute,
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

  //     this.getMailLogDetails();
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

    this.getMailLogDetails();
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

  getMailLogDetails(): void {
    this.dataprovider.getMailLogDetails(this.page, this.size, this.search).subscribe({
      next: (response) => {
        this.apiResponse = response;
        this.mailLogs = response.data || [];

        console.log(this.mailLogs);
      },
      error: (error) => {
        console.error('Error fetching mail log report:', error);
      },
    });
  }

  formatDateTime(value: any): string {
    if (!value) {
      return '';
    }

    if (typeof value === 'string' && /^\d{2} [A-Za-z]{3} \d{4}/.test(value)) {
      return value;
    }

    return this.datePipe.transform(value, 'dd MMM yyyy HH:mm') || '';
  }

  getStatusClass(status: number): string {
    if (status === 1) {
      return 'status-sent';
    }
    if (status === 2) {
      return 'status-failed';
    }
    return 'status-other';
  }

  viewMail(log: MailLog): void {
    Swal.fire({
      title: log.subject || 'Mail',
      html: `
      <div class="mail-meta">
        <div><strong>To:</strong> <span id="mail-to"></span></div>
          <div  id="mail-cc-row"><strong>CC:</strong> <span id="mail-cc"></span></div>
        <div><strong>Date:</strong> <span id="mail-date"></span></div>
      </div>

      <iframe id="mail-frame"
        style="width:100%;height:320px;border:1px solid #d5dee7;margin-top:10px;background:#fff;">
      </iframe>
    `,
      width: 720,
      confirmButtonText: 'Close',

      didOpen: () => {
        const to = document.getElementById('mail-to');
        const date = document.getElementById('mail-date');
        const frame = document.getElementById('mail-frame') as HTMLIFrameElement;
        const cc = document.getElementById('mail-cc');
        const ccRow = document.getElementById('mail-cc-row');
        if (to) {
          const emails = (log.to || '')
            .split(',')
            .map((email) => email.trim())
            .join('<br>');

          to.innerHTML = `${log.name || ''}
          <br>
          ${emails}`;
        }

        if (cc && ccRow) {
          const ccEmails = (log.cc || '')
            .split(',')
            .map((email: string) => email.trim())
            .filter((email: string) => email)
            .join('<br>');
          if (ccEmails) {
            cc.innerHTML = ccEmails;
            ccRow.style.display = 'block';
          } else {
            ccRow.style.display = 'none';
          }
          cc.innerHTML = ccEmails || '-';
        }

        if (date) {
          date.textContent = this.formatDateTime(log.regDate);
        }

        if (frame) {
          frame.srcdoc = '<p style="padding:10px">Loading...</p>';
        }

        this.dataprovider.getMailLogHtml(log.mailLogId).subscribe({
          next: (response: any) => {
            if (frame) {
              // If API returns plain HTML string
              if (typeof response === 'string') {
                frame.srcdoc = response;
              } else if (response?.data) {
                frame.srcdoc = response.data;
              } else if (response?.htmlContent) {
                frame.srcdoc = response.htmlContent;
              } else {
                frame.srcdoc = '<p>No mail content available.</p>';
              }
            }
          },
          error: () => {
            if (frame) {
              frame.srcdoc = '<p style="color:red;padding:10px;">Unable to load mail content.</p>';
            }
          },
        });
      },
    });
  }

  get paginatedLogs(): MailLog[] {
    return this.mailLogs;
  }

  goToPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages) {
      return;
    }

    this.currentPage = pageNumber;
    this.page = pageNumber - 1;

    // this.router
    //   .navigate(['/mail-log-report'], {
    //     queryParams: {
    //       currentPage: this.currentPage,
    //       searchText: this.search || '',
    //       page: this.page,
    //       size: this.size || 10,
    //     },
    //   })
    //   .then(() => this.getMailLogDetails());

    this.saveFilterState();
    this.getMailLogDetails();
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

    // this.router.navigate(['/mail-log-report'], {
    //   queryParams: {
    //     currentPage: this.currentPage,
    //     searchText: this.search,
    //     page: this.page,
    //     size: this.size,
    //   },
    // });

    this.saveFilterState();
    this.getMailLogDetails();
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
