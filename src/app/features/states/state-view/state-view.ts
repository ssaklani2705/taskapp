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
  selector: 'app-state-view',
  imports: [CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatListModule],
  templateUrl: './state-view.html',
  styleUrl: './state-view.scss',
})
export class StateView implements OnInit {
  stateId!: number;
state: any = {};
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
  ) { }




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
      ['/state-index'],
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

  ngOnInit(): void {

    const stateId = this.route.snapshot.params['stateId'];

    console.log('Route params:', this.route.snapshot.params);
    console.log('stateId value:', stateId);

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

    if (stateId) {
      this.taskcategoryId = Number(stateId);
      this.getTaskCategoryDetails();
    }
  }
  getTaskCategoryDetails(): void {

    this.dataprovider
      .getStateById(this.taskcategoryId)
      .subscribe({

        next: (response: any) => {

          if (!response || !response.data) {
            console.error('State data not found');
            return;
          }

          const data = response.data;

          this.taskCategory = {
            stateId: data.stateId,
            name: data.name,
            code: data.code,
            status: data.status,
            userId: data.userId,
            registrationDate: data.registrationDate,
            modificationDate: data.modificationDate
          };

          // Keep history logic unchanged
          this.transactionHistory =
            data.transactionHistory || [];

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
            'Failed to fetch state details',
            err
          );

        },
      });
  }
}
