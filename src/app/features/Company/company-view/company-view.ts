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
}