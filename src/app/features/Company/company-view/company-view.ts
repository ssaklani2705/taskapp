import { Component, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {  Inject, PLATFORM_ID } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DataProviderService } from '../../../service/data-provider.service';
import { Common } from '../../../classes/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-company-view',
   imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatTableModule, MatSortModule, MatListModule],
  templateUrl: './company-view.html',
  styleUrl: './company-view.scss',
})
export class CompanyView implements OnInit {
  companyId = 0;
  userId = 0;

  company: any = {};
  states: any[] = [];
  transactionHistory: any[] = [];
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private dataProvider: DataProviderService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.userId = Number(sessionStorage.getItem('userId')) || 0;
    }

    this.companyId =
      Number(this.route.snapshot.paramMap.get('companyId')) || 0;

    this.loadStates();
    this.loadCompanyDetails();
    this.loadShifts();
  }

  loadCompanyDetails(): void {
    this.isLoading = true;

    this.dataProvider.getCompanyById(this.companyId).subscribe({
      next: (response: any) => {
        this.isLoading = false;

        if (!response?.success || !response?.data) {
          this.company = {};
          this.transactionHistory = [];

          Swal.fire({
            icon: 'error',
            title: 'Not Found',
            text: response?.message || 'Company not found.',
            confirmButtonColor: '#d33',
          }).then(() => this.backToIndexPage());

          return;
        }

        // Company details
        this.company = response.data;

        // Transaction history
        this.transactionHistory =
          response.data.transactionHistory || [];
      },

      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching company details:', error);

        this.company = {};
        this.transactionHistory = [];

        Swal.fire({
          icon: 'error',
          title: 'Load Failed',
          text: error?.error?.message || 'Unable to load company details.',
          confirmButtonColor: '#d33',
        });
      },
    });
  }

  loadStates(): void {
    this.dataProvider.getStates().subscribe({
      next: (response: any) =>
        (this.states = response?.data || response || []),
      error: () => (this.states = []),
    });
  }

  get stateName(): string {
    return (
      this.states.find(
        (s) => s.stateId === this.company?.stateId
      )?.name ?? ''
    );
  }

  backToIndexPage(): void {
    this.router.navigate(['/company-index']);
  }

  getStatusClass(status: number | string): string {
    switch (+status) {
      case 1: return 'status-badge active';
      case 2: return 'status-badge inactive';
      case 3: return 'status-badge deleted';
      default: return 'status-badge';
    }
  }

  getStatusLabel(status: number | string): string {
    switch (+status) {
      case 1: return 'Active';
      case 2: return 'Inactive';
      case 3: return 'Deleted';
      default: return 'Unknown';
    }
  }


  //Shirt 
  shifts: any[] = [];
showShiftModal = false;
isEditShift = false;
isSavingShift = false;
shiftSubmitted = false;
shiftForm: any = this.emptyShiftForm();

private emptyShiftForm() {
  return { shiftId: 0, shiftName: '', fromTime: '', toTime: '' };
}

loadShifts(): void {
  this.dataProvider.getCompanyShifts(this.companyId).subscribe({
    next: (res: any) => (this.shifts = res?.success ? res.data || [] : []),
    error: () => (this.shifts = []),
  });
}

openAddShift(): void {
  this.isEditShift = false;
  this.shiftSubmitted = false;
  this.shiftForm = this.emptyShiftForm();
  this.showShiftModal = true;
}

openEditShift(s: any): void {
  this.isEditShift = true;
  this.shiftSubmitted = false;
  this.shiftForm = {
    shiftId: s.shiftId,
    shiftName: s.shiftName,
    fromTime: s.fromTime,
    toTime: s.toTime,
  };
  this.showShiftModal = true;
}

closeShiftModal(): void {
  if (this.isSavingShift) return;
  this.showShiftModal = false;
}

saveShift(): void {
  this.shiftSubmitted = true;
  const f = this.shiftForm;

  if (!f.shiftName?.trim() || !f.fromTime || !f.toTime) return;
  if (f.fromTime === f.toTime) {
    Swal.fire({ icon: 'warning', title: 'Invalid Time', text: 'From time and To time cannot be same.', confirmButtonColor: '#19345a' });
    return;
  }

  const body = {
    shiftId: f.shiftId,
    shiftName: f.shiftName.trim(),
    fromTime: f.fromTime,
    toTime: f.toTime,
    companyId: this.companyId,
  };

  this.isSavingShift = true;
  const req$ = this.isEditShift
    ? this.dataProvider.updateCompanyShift(body)
    : this.dataProvider.addCompanyShift(body);

  req$.subscribe({
    next: (res: any) => {
      this.isSavingShift = false;
      if (res?.success) {
        this.showShiftModal = false;
        this.loadShifts();
        Swal.fire({ icon: 'success', title: 'Success', text: res.message, timer: 1500, showConfirmButton: false });
      } else {
        Swal.fire({ icon: 'error', title: 'Failed', text: res?.message || 'Unable to save shift.', confirmButtonColor: '#d33' });
      }
    },
    error: (err) => {
      this.isSavingShift = false;
      Swal.fire({ icon: 'error', title: 'Failed', text: err?.error?.message || 'Unable to save shift.', confirmButtonColor: '#d33' });
    },
  });
}

deleteShift(s: any): void {
  Swal.fire({
    icon: 'warning',
    title: 'Delete shift?',
    text: `"${s.shiftName}" will be removed.`,
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Delete',
  }).then((r) => {
    if (!r.isConfirmed) return;
    this.dataProvider.deleteCompanyShift(s.shiftId).subscribe({
      next: (res: any) => {
        if (res?.success) this.loadShifts();
        else Swal.fire({ icon: 'error', title: 'Failed', text: res?.message, confirmButtonColor: '#d33' });
      },
      error: (err) =>
        Swal.fire({ icon: 'error', title: 'Failed', text: err?.error?.message || 'Unable to delete shift.', confirmButtonColor: '#d33' }),
    });
  });
}


getCompanyTypeLabel(value: number | string | null): string {
  switch (Number(value)) {
    case 1:
      return 'Main';
    case 2:
      return 'Site';
    default:
      return '-';
  }
}

getWorkingDaysLabel(value: string | number[] | null): string {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return '-';
  }

  const days: Record<number, string> = {
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
    7: 'Sunday',
  };

  const selectedDays = Array.isArray(value)
    ? value
    : String(value).split(',').map(Number);

  return selectedDays
    .map(day => days[Number(day)])
    .filter(Boolean)
    .join(', ') || '-';
}

}