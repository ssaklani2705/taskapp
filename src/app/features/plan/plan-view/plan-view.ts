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
  templateUrl: './plan-view.html',
  styleUrl: './plan-view.scss',
})
export class PlanView implements OnInit {

  planId!: number;


  plan: any = {};

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

  
  backToIndexPage(): void {

    this.router.navigate(
      ['/plan-index'],
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

    const planId = this.route.snapshot.params['planId'];

    console.log('Route params:', this.route.snapshot.params);
    console.log('planId value:', planId);

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

    if (planId) {
      this.planId = Number(planId);
      this.getPlanDetails();
    }
  }
 getPlanDetails(): void {

  this.dataprovider
    .getPlanById(this.planId)
    .subscribe({

      next: (response: any) => {

        if (!response || !response.data) {
          console.error('Plan data not found');
          return;
        }

        const data = response.data;

        this.plan = {
          planId: data.planId,
          name: data.name,
          rate: data.rate,
          description: data.description,
          status: data.status,
          userId: data.userId
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
          'Failed to fetch plan details',
          err
        );

      }
    });
}
}
