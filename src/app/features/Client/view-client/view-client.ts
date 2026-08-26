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

@Component({
  selector: 'app-view-client',
  imports: [
    CommonModule,
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

  currentPage = 1;
  searchText = '';
  statusIndex = 0;
  page = 0;
  size = 5;

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
