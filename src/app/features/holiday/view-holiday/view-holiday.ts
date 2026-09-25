import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

import { ActivatedRoute, Router } from '@angular/router';

import { Common } from '../../../classes/common';
import { DataProviderService } from '../../../service/data-provider.service';

@Component({
  selector: 'app-view-holiday',
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
  templateUrl: './view-holiday.html',
  styleUrl: './view-holiday.scss',
})
export class ViewHolidayComponent implements OnInit {

  holidayId!: number;

  holiday: any = {};

  transactionHistory: any[] = [];

  common = new Common();

  // Pagination / Filter state
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

    // Get Holiday ID from route
    this.holidayId =
      +this.route.snapshot.paramMap.get('holidayId')!;

    // Get pagination/filter values
    const queryParams = this.route.snapshot.queryParamMap;

    this.currentPage =
      Number(queryParams.get('currentPage')) || 1;

    this.searchText =
      queryParams.get('searchText') || '';

    this.statusIndex =
      Number(queryParams.get('statusIndex')) || 0;

    this.page =
      Number(queryParams.get('page')) ||
      this.currentPage - 1;

    this.size =
      Number(queryParams.get('size')) || 5;

    // Load holiday
    this.getHolidayDetails();
  }

  getHolidayDetails(): void {

    this.dataprovider
      .getHolidayById(this.holidayId)
      .subscribe({
        next: (response) => {

          console.log('Holiday response:', response);

          if (response && response.data) {

            this.holiday = {
              holidayId: response.data.holidayId,
              name: response.data.name,
              startDate: response.data.startDate,
              endDate: response.data.endDate,
              status: response.data.status,
              userId: response.data.userId,
              regdate: response.data.regdate,
              moddate: response.data.moddate,
            };

            this.transactionHistory =
              response.data.transactionHistory || [];

            // Sort latest action first
            this.transactionHistory =
              this.transactionHistory.sort(
                (a: any, b: any) => {

                  const dateA =
                    this.common.parseEntryDate(a.entryDate);

                  const dateB =
                    this.common.parseEntryDate(b.entryDate);

                  return (
                    dateB.getTime() -
                    dateA.getTime()
                  );
                },
              );
          }
        },

        error: (err) => {
          console.error(
            'Failed to fetch holiday details',
            err,
          );
        },
      });
  }

  get hasTransactionHistory(): boolean {

    return (
      Array.isArray(this.transactionHistory) &&
      this.transactionHistory.length > 0
    );
  }

  backToIndexPage(): void {

    this.router.navigate(
      ['/hodiday-index'],
      {
        queryParams: {
          currentPage: this.currentPage,
          statusIndex: this.statusIndex,
          searchText: this.searchText,
          page: this.page,
          size: this.size || 5,
        },
      },
    );
  }
}