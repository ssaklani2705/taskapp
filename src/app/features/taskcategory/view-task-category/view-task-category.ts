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
  selector: 'app-view-task-category',
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
  templateUrl: './view-task-category.html',
  styleUrl: './view-task-category.scss',
})
export class ViewTaskCategoryComponent implements OnInit {

  taskcategoryId!: number;

  taskCategory: any = {};

  transactionHistory: any[] = [];

  common = new Common();

  // Pagination / Filter state
  currentPage = 1;
  searchText = '';
  statusIndex = 0;
  departmentId = 0;
  page = 0;
  size = 5;

  constructor(
    private route: ActivatedRoute,
    private dataprovider: DataProviderService,
    private router: Router,
  ) {}

  ngOnInit(): void {

    /*
     * Get Task Category ID from URL
     *
     * Example:
     * /view-task-category/10
     */
    this.taskcategoryId =
      +this.route.snapshot.paramMap.get('taskCategoryId')!;

    /*
     * Get filter/pagination information
     * from query parameters
     */
    const queryParams =
      this.route.snapshot.queryParamMap;

    this.currentPage =
      Number(queryParams.get('currentPage')) || 1;

    this.searchText =
      queryParams.get('searchText') || '';

    this.statusIndex =
      Number(queryParams.get('statusIndex')) || 0;

    this.departmentId =
      Number(queryParams.get('departmentId')) || 0;

    this.page =
      Number(queryParams.get('page')) ||
      this.currentPage - 1;

    this.size =
      Number(queryParams.get('size')) || 5;

    /*
     * Fetch Task Category
     */
    this.getTaskCategoryDetails();
  }

  /**
   * Get Task Category details by ID
   */
  getTaskCategoryDetails(): void {

    this.dataprovider
      .getTaskCategoryById(this.taskcategoryId)
      .subscribe({
        next: (response: any) => {

          if (!response || !response.data) {
            console.error(
              'Task Category data not found'
            );
            return;
          }

          const data = response.data;

          /*
           * Store task category information
           */
          this.taskCategory = {
            taskcategoryId: data.taskcategoryId,
            departmentId: data.departmentId,
            departmentName: data.departmentName,
            name: data.name,
            status: data.status,
            userId: data.userId,
            regdate: data.regdate,
            moddate: data.moddate,
          };

          /*
           * Transaction History
           */
          this.transactionHistory =
            data.transactionHistory || [];

          /*
           * Sort latest action first
           */
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
        },

        error: (err) => {

          console.error(
            'Failed to fetch task category details',
            err
          );

        },
      });
  }

  /**
   * Check whether transaction history exists
   */
  get hasTransactionHistory(): boolean {

    return (
      Array.isArray(
        this.transactionHistory
      ) &&
      this.transactionHistory.length > 0
    );
  }

  /**
   * Back to Task Category Index
   *
   * Preserves:
   * - current page
   * - status
   * - search
   * - department
   * - page
   * - size
   */
  backToIndexPage(): void {

    this.router.navigate(
      ['/task-category-master'],
      {
        queryParams: {

          currentPage:
            this.currentPage,

          statusIndex:
            this.statusIndex,

          searchText:
            this.searchText,

          departmentId:
            this.departmentId,

          page:
            this.page,

          size:
            this.size || 5,
        },
      }
    );
  }
}
