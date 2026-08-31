import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataProviderService } from '../../../service/data-provider.service';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import Swal from 'sweetalert2';
import { SESSION_KEYS } from '../../../service/session-storage.keys';

interface Recurring {
  recurringId: number;
  clientId: number;
  clientName: string;
  title: string;
  description: string;
  type: number;
  date: number | null;
  day: number | null;
  month: number | null;
  taskCatId: number;
  taskCatName: string;
  status: number;
  regDate?: string | null;
  modDate?: string | null;

  transactionHistory?: any[];
}

@Component({
  selector: 'app-view-recurring',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDividerModule],
  templateUrl: './view-recurring.html',
  styleUrl: './view-recurring.scss',
})
export class ViewRecurring implements OnInit {
  recurringId!: number;

  recurring: Recurring | null = null;

  transactionHistory: any[] = [];

  loading = false;

  currentPage = 1;
  searchText = '';
  statusIndex = 0;
  page = 0;
  size = 5;

  filterKey = SESSION_KEYS.RECURRING_FILTER;

  constructor(
    private route: ActivatedRoute,
    private dataprovider: DataProviderService,
    private router: Router,
    @Inject(PLATFORM_ID)
    private platformId: Object,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('recurringId');

    if (id) {
      this.recurringId = Number(id);
    }

    this.restoreFilterState();

    if (this.recurringId) {
      this.getRecurringDetails();
    } else {
      console.error('Recurring ID not found in route.');
    }
  }

  getRecurringDetails(): void {
    this.loading = true;

    if (!this.recurringId) {
      this.loading = false;
      return;
    }

    if (!isPlatformBrowser(this.platformId)) {
      this.loading = false;
      return;
    }

    const storedUserId = sessionStorage.getItem('userId');

    const userId = storedUserId ? Number(storedUserId) : null;

    if (!userId) {
      this.loading = false;

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'User session not found.',
      });

      return;
    }

    this.dataprovider.getRecurringDetailsById(this.recurringId, userId).subscribe({
      next: (response: any) => {
        console.log('Recurring details response:', response);

        if (response && response.success && response.data) {
          this.recurring = response.data;

          this.transactionHistory = response.data.transactionHistory || [];

          this.transactionHistory = this.transactionHistory.sort((a: any, b: any) => {
            const dateA = this.parseDate(a.entryDate);

            const dateB = this.parseDate(b.entryDate);

            return dateB.getTime() - dateA.getTime();
          });
        } else {
          this.recurring = null;
          this.transactionHistory = [];

          console.error('Recurring details not found:', response);
        }

        this.loading = false;
      },

      error: (error: any) => {
        console.error('Failed to fetch recurring details:', error);

        this.recurring = null;
        this.transactionHistory = [];
        this.loading = false;

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error?.error?.message || error?.error || 'Unable to load recurring details.',
        });
      },
    });
  }

  getTypeLabel(type: number | null | undefined): string {
    if (type === null || type === undefined) {
      return '-';
    }

    switch (Number(type)) {
      case 1:
        return 'Daily';

      case 2:
        return 'Weekly';

      case 3:
        return 'Monthly';

      case 4:
        return 'Yearly';

      default:
        return String(type);
    }
  }

  getDayLabel(day: number | null | undefined): string {
    if (day === null || day === undefined) {
      return '-';
    }

    switch (Number(day)) {
      case 1:
        return 'Monday';

      case 2:
        return 'Tuesday';

      case 3:
        return 'Wednesday';

      case 4:
        return 'Thursday';

      case 5:
        return 'Friday';

      case 6:
        return 'Saturday';

      case 7:
        return 'Sunday';

      default:
        return String(day);
    }
  }

  getMonthLabel(month: number | null | undefined): string {
    if (month === null || month === undefined) {
      return '-';
    }

    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    return months[Number(month) - 1] || String(month);
  }

  getSchedule(): string {
    if (!this.recurring) {
      return '-';
    }

    switch (Number(this.recurring.type)) {
      case 1:
        return 'Daily';

      case 2:
        return this.getDayLabel(this.recurring.day);

      case 3:
        return this.recurring.date
          ? `On the ${this.recurring.date}${this.getOrdinalSuffix(this.recurring.date)} of each month`
          : '-';

      case 4:
        if (this.recurring.date && this.recurring.month) {
          return `Every ${this.recurring.date}${this.getOrdinalSuffix(
            this.recurring.date,
          )} ${this.getMonthLabel(this.recurring.month)}`;
        }

        return '-';

      default:
        return '-';
    }
  }

  private getOrdinalSuffix(date: number): string {
    if (date >= 11 && date <= 13) {
      return 'th';
    }

    switch (date % 10) {
      case 1:
        return 'st';

      case 2:
        return 'nd';

      case 3:
        return 'rd';

      default:
        return 'th';
    }
  }

  getStatusLabel(status: number | null | undefined): string {
    if (status === null || status === undefined) {
      return '-';
    }

    switch (Number(status)) {
      case 1:
        return 'Active';

      case 2:
        return 'Inactive';

      case 3:
        return 'Deleted';

      default:
        return String(status);
    }
  }

  getStatusClass(status: number | null | undefined): string {
    if (status === null || status === undefined) {
      return 'status-default';
    }

    switch (Number(status)) {
      case 1:
        return 'status-active';

      case 2:
        return 'status-inactive';

      case 3:
        return 'status-closed';

      default:
        return 'status-default';
    }
  }

  formatDate(value: any): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return String(value);
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return day + '-' + month + '-' + year;
  }

  formatDateTime(value: any): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return String(value);
    }

    const day = String(date.getDate()).padStart(2, '0');

    const month = String(date.getMonth() + 1).padStart(2, '0');

    const year = date.getFullYear();

    let hours = date.getHours();

    const minutes = String(date.getMinutes()).padStart(2, '0');

    const seconds = String(date.getSeconds()).padStart(2, '0');

    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;

    hours = hours || 12;

    const hourString = String(hours).padStart(2, '0');

    return (
      day + '-' + month + '-' + year + ' ' + hourString + ':' + minutes + ':' + seconds + ' ' + ampm
    );
  }


  private parseDate(value: any): Date {
    if (!value) {
      return new Date(0);
    }

    const date = new Date(value);

    if (!isNaN(date.getTime())) {
      return date;
    }

    const match = String(value).match(/^(\d{2})-(\d{2})-(\d{4})/);

    if (match) {
      return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
    }

    return new Date(0);
  }

  private restoreFilterState(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const stored = sessionStorage.getItem(this.filterKey);

    if (!stored) {
      return;
    }

    try {
      const filterState = JSON.parse(stored);
      this.currentPage = Number(filterState.currentPage || 1);
      this.searchText = filterState.searchText || '';
      this.statusIndex = Number(filterState.statusIndex || 0);
      this.page = Number(filterState.page ?? this.currentPage - 1);
      this.size = Number(filterState.size || 5);
    } catch (error) {
      console.error('Error restoring recurring filter state:', error);
    }
  }

  backToIndexPage(): void {
    this.router.navigate(['/recurring-index'], {
      state: {
       currentPage: this.currentPage,
        statusIndex: this.statusIndex,
        searchText: this.searchText,
        page: this.page,
        size: this.size,
      },
    });
  }


  get hasTransactionHistory(): boolean {
    return Array.isArray(this.transactionHistory) && this.transactionHistory.length > 0;
  }
}
