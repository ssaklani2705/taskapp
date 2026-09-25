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
    this.taskcategoryId = +this.route.snapshot.paramMap.get('taskCategoryId')!;

    // this.route.queryParams.subscribe((params) => {
    //   this.currentPage = +(params['currentPage'] || 1);
    //   this.searchText = params['searchText'] || '';
    //   this.statusIndex = +(params['statusIndex'] || 0);
    //   this.departmentId = +(params['departmentId'] || '');
    //   this.page = +(params['page'] || 0);
    //   this.size = +(params['size'] || 5);
    // });

    this.getTaskCategoryDetails();
  }

  getTaskCategoryDetails(): void {
    this.dataprovider.getTaskCategoryById(this.taskcategoryId).subscribe({
      next: (response: any) => {
        if (!response || !response.data) {
          console.error('Task Category data not found');
          return;
        }

        const data = response.data;

        this.taskCategory = {
          taskcategoryId: data.taskcategoryId,
          departmentId: data.departmentId,
          departmentName: data.departmentName,
          name: data.name,
          status: data.status,
          userId: data.userId,
          regdate: data.regdate,
          moddate: data.moddate,
          dueDateTime: data.dueDateTime,
        };

        this.transactionHistory = data.transactionHistory || [];

        this.transactionHistory = this.transactionHistory.sort((a: any, b: any) => {
          const dateA = this.common.parseEntryDate(a.entryDate);
          const dateB = this.common.parseEntryDate(b.entryDate);

          return dateB.getTime() - dateA.getTime();
        });
      },

      error: (err) => {
        console.error('Failed to fetch task category details', err);
      },
    });
  }

  get hasTransactionHistory(): boolean {
    return Array.isArray(this.transactionHistory) && this.transactionHistory.length > 0;
  }

  // backToIndexPage(): void {
  //   this.router.navigate(['/task-category-index'], {
  //     queryParams: {
  //       currentPage: this.currentPage,
  //       statusIndex: this.statusIndex,
  //       searchText: this.searchText,
  //       departmentId: this.departmentId || '',
  //       page: this.page,
  //       size: this.size || 5,
  //     },
  //   });
  // }

  backToIndexPage(): void {
    this.router.navigate(['/task-category-index']);
  }
}
