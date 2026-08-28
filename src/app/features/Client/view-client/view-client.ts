import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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

   addPer = 'N';
  editPer = 'N';
  deletePer = 'N';
  exportExcel = 'N';

  constructor(
    private route: ActivatedRoute,
    private dataprovider: DataProviderService,
    private router: Router,
  ) {}

  ngOnInit(): void {
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
      alert('Please select a different manager.');
      return;
    }

    this.isChangingManager = true;

    this.dataprovider.changeClientManager(this.clientId, this.selectedManagerId).subscribe({
      next: (response: any) => {
        console.log('Change manager response:', response);

        this.isChangingManager = false;

        if (response?.success === false) {
          alert(response.message || 'Failed to change manager.');
          return;
        }

        alert('Manager changed successfully.');

        this.showChangeManagerModal = false;
        this.selectedManagerId = null;

        this.getClientDetails();
      },

      error: (error) => {
        this.isChangingManager = false;

        console.error('Change manager error:', error);

        alert(error?.error?.message || 'Failed to change manager.');
      },
    });
  }

  openChangeManagerModal(): void {
    this.managerValidationError = false;

    this.selectedManagerId = this.client?.managerId ? Number(this.client.managerId) : null;

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
      },
    });
  }
}
