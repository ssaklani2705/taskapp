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
  selector: 'app-view-designation',
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
  templateUrl: './view-designation.html',
  styleUrl: './view-designation.scss',
})
export class ViewDesignation implements OnInit {

  designationId!: number;

  designation: any = {};

  transactionHistory: any[] = [];

  common = new Common();

  // Pagination / filter state
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

    // Get designation ID from URL
    this.designationId =
      +this.route.snapshot.paramMap.get('designationId')!;

    // Get previous index page state
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

    this.getDesignationDetails();
  }

  /**
   * Get designation details by ID
   */
  getDesignationDetails(): void {

    this.dataprovider
      .getDesigmationById(this.designationId)
      .subscribe({
        next: (response) => {

          if (response && response.success && response.data) {

            this.designation = {
              designationId: response.data.designationId,
              name: response.data.name,
              sequence: response.data.sequence,
              status: response.data.status,
            };

            this.transactionHistory =
              response.data.transactionHistory || [];

            // Latest history first
            this.transactionHistory =
              this.transactionHistory.sort(
                (a: any, b: any) => {

                  const dateA =
                    this.common.parseEntryDate(
                      a.entryDate
                    );

                  const dateB =
                    this.common.parseEntryDate(
                      b.entryDate
                    );

                  return (
                    dateB.getTime() -
                    dateA.getTime()
                  );
                }
              );

          } else {

            console.error(
              'Designation details not found'
            );

          }
        },

        error: (err) => {

          console.error(
            'Failed to fetch designation details',
            err
          );

        },
      });
  }

  /**
   * Check whether history exists
   */
  get hasTransactionHistory(): boolean {

    return (
      Array.isArray(this.transactionHistory) &&
      this.transactionHistory.length > 0
    );
  }

  /**
   * Back to designation index
   */
  backToIndexPage(): void {

    this.router.navigate(
      ['/designation-master'],
      {
        queryParams: {

          currentPage:
            this.currentPage,

          statusIndex:
            this.statusIndex,

          searchText:
            this.searchText,

          page:
            this.page,

          size:
            this.size || 5,
        },
      }
    );
  }
}
