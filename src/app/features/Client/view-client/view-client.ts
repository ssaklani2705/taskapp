import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
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
  selector: 'app-view-client',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatListModule,
  ],
  templateUrl: './view-client.html',
  styleUrl: './view-client.scss',
})
export class ViewClient {
  clientId!: number;
  userId!: number;

  client: any = {};

  transactionHistory: any[] = [];
  common = new Common();

  managers: any[] = [];

  showChangeManagerModal = false;
  selectedManagerId: number | null = null;
  managerValidationError = false;
  isChangingManager = false;

  currentPage = 1;
  searchText = '';
  statusIndex = 0;
  page = 0;
  size = 5;

  stateId = 0;
  managerId = 0;
  planId = 0;

  gstFlag: number | null = null;
  taxFlag: number | null = null;

  fromDate: Date | null = null;
  toDate: Date | null = null;

  showChangeOutstandingModal = false;
  newOutstanding: number | null = null;
  isChangingOutstanding = false;
  outstandingValidationError = false;

  constructor(
    private route: ActivatedRoute,
    private dataprovider: DataProviderService,
    private router: Router,
    @Inject(PLATFORM_ID)
    private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedUserId = sessionStorage.getItem('userId');

      if (storedUserId) {
        this.userId = Number(storedUserId);
      }
    }

    this.clientId = +this.route.snapshot.paramMap.get('clientId')!;

    const queryParams = this.route.snapshot.queryParamMap;

    this.currentPage = Number(queryParams.get('currentPage')) || 1;
    this.searchText = queryParams.get('searchText') || '';
    this.statusIndex = Number(queryParams.get('statusIndex')) || 0;
    this.page = Number(queryParams.get('page')) || this.currentPage - 1;
    this.size = Number(queryParams.get('size')) || 5;

    this.getClientDetails();
  }

  getClientDetails(): void {
    this.dataprovider.getClientDetailsByClientId(this.clientId).subscribe({
      next: (response: any) => {
        console.log('Client Details:', response);

        this.client = response || {};

        this.transactionHistory = Array.isArray(response?.transactionHistory)
          ? response.transactionHistory
          : [];
      },

      error: (error) => {
        console.error('Error fetching client details:', error);

        this.client = {};
        this.transactionHistory = [];
      },
    });
  }

  loadManagers(): void {
    this.dataprovider.getManagers().subscribe({
      next: (response: any) => {
        this.managers = response?.data || response || [];
      },

      error: (error) => {
        console.error('Error loading managers:', error);
        this.managers = [];
      },
    });
  }

  changeManager(): void {
    this.managerValidationError = false;

    if (!this.selectedManagerId) {
      this.managerValidationError = true;
      return;
    }

    if (this.selectedManagerId === Number(this.client?.managerId)) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Selection',
        text: 'Please select a different manager.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#f0ad4e',
      });

      return;
    }

    this.isChangingManager = true;

    this.dataprovider.changeClientManager(this.clientId, this.selectedManagerId,this.userId).subscribe({
      next: (response: any) => {
        console.log('Change manager response:', response);

        this.isChangingManager = false;

        if (response?.success === false) {
          Swal.fire({
            icon: 'error',
            title: 'Change Failed',
            text: response.message || 'Failed to change manager.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d33',
          });

          return;
        }

        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Manager changed successfully.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3085d6',
        }).then((result) => {
          if (result.isConfirmed) {
            this.showChangeManagerModal = false;
            this.selectedManagerId = null;

            this.getClientDetails();
          }
        });
      },

      error: (error) => {
        this.isChangingManager = false;

        console.error('Change manager error:', error);

        Swal.fire({
          icon: 'error',
          title: 'Change Failed',
          text: error?.error?.message || 'Failed to change manager.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d33',
        });
      },
    });
  }

  openChangeManagerModal(): void {
    if (Number(this.client?.status) === 3) {
      return;
    }

    this.managerValidationError = false;
    this.selectedManagerId = null;

    this.loadManagers();

    this.showChangeManagerModal = true;
  }

  closeChangeManagerModal(): void {
    if (this.isChangingManager) {
      return;
    }

    this.showChangeManagerModal = false;
    this.selectedManagerId = null;
    this.managerValidationError = false;
  }

  openChangeOutstandingModal(): void {
    this.newOutstanding =
      this.client?.outstanding !== null && this.client?.outstanding !== undefined
        ? Number(this.client.outstanding)
        : 0;

    this.outstandingValidationError = false;

    this.showChangeOutstandingModal = true;
  }

  closeChangeOutstandingModal(): void {
    if (this.isChangingOutstanding) {
      return;
    }

    this.showChangeOutstandingModal = false;
    this.outstandingValidationError = false;
    this.newOutstanding = null;
  }

  updateOutstanding(): void {
    this.outstandingValidationError = false;

    if (
      this.newOutstanding === null ||
      this.newOutstanding === undefined ||
      Number.isNaN(Number(this.newOutstanding)) ||
      Number(this.newOutstanding) < 0
    ) {
      this.outstandingValidationError = true;
      return;
    }

    if (!this.client?.clientId) {
      return;
    }

    if (!this.client?.managerId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Manager information is not available for this client.',
        confirmButtonText: 'OK',
      });
      return;
    }

    this.isChangingOutstanding = true;

    const outstanding = Number(this.newOutstanding);
    const managerId = Number(this.client.managerId);
    const userId = Number(this.userId);

    console.log('Updating outstanding:', {
      clientId: this.client.clientId,
      outstanding: outstanding,
      managerId: managerId,
      userId: userId
    });

    this.dataprovider
      .updateClientOutstanding(this.client.clientId, outstanding, managerId,userId)
      .subscribe({
        next: (response: any) => {
          console.log('Update Outstanding Response:', response);

          this.isChangingOutstanding = false;

          if (response?.success === true) {
            // Update the current value immediately
            this.client.outstanding = outstanding;

            Swal.fire({
              icon: 'success',
              title: 'Updated',
              text: response.message || 'Outstanding updated successfully.',
              timer: 1500,
              showConfirmButton: false,
            }).then(() => {
              // Close modal
              this.closeChangeOutstandingModal();

              // Refresh client details + action history
              this.getClientDetails();
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Unable to Update',
              text: response?.message || 'Failed to update outstanding.',
              confirmButtonText: 'OK',
            });
          }
        },

        error: (error) => {
          console.error('Error updating outstanding:', error);

          this.isChangingOutstanding = false;

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text:
              error?.error?.message ||
              error?.error ||
              'Something went wrong while updating outstanding.',
            confirmButtonText: 'OK',
          });
        },
      });
  }

  get hasTransactionHistory(): boolean {
    return Array.isArray(this.transactionHistory) && this.transactionHistory.length > 0;
  }

  backToIndexPage(): void {
    this.router.navigate(['/client-index'], {
      queryParams: {
        currentPage: this.currentPage,
        statusIndex: this.statusIndex,
        searchText: this.searchText,
        page: this.page,
        size: this.size || 5,
        stateId: this.stateId,
        managerId: this.managerId,
        planId: this.planId,
        gstFlag: this.gstFlag,
        taxFlag: this.taxFlag,
        fromDate: this.formatDate(this.fromDate),
        toDate: this.formatDate(this.toDate),
      },
    });
  }

  private formatDate(date: Date | null): string {
    if (!date) {
      return '';
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }
}
