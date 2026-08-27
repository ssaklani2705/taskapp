import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

import { ActivatedRoute, Router } from '@angular/router';

import { DataProviderService } from '../../../service/data-provider.service';
import { Common } from '../../../classes/common';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-view-index',

  standalone: true,

  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTableModule
  ],

  templateUrl: './view-index.html',
  styleUrl: './view-index.scss'
})
export class ViewIndex implements OnInit {

  // =========================================================
  // TASK ID
  // =========================================================

  taskId!: number;


  // =========================================================
  // TASK OBJECT
  // =========================================================

  task: any = null;


  // =========================================================
  // TRANSACTION HISTORY
  // =========================================================

  transactionHistory: any[] = [];


  // =========================================================
  // CLIENT LIST
  // =========================================================

  clients: any[] = [];


  // =========================================================
  // USER LIST
  // =========================================================

  users: any[] = [];


  // =========================================================
  // TASK CATEGORY LIST
  // =========================================================

  taskCategories: any[] = [];


  // =========================================================
  // COMMON
  // =========================================================

  common = new Common();


  // =========================================================
  // LOADING
  // =========================================================

  loading = false;


  // =========================================================
  // PAGINATION / FILTER STATE
  // =========================================================

  currentPage = 1;

  searchText = '';

  statusIndex = 0;

  page = 0;

  size = 5;


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private route: ActivatedRoute,
    private dataprovider: DataProviderService,
    private router: Router
  ) {}


  // =========================================================
  // ON INIT
  // =========================================================

  ngOnInit(): void {

    // -------------------------------------------------------
    // GET TASK ID FROM ROUTE
    // Example:
    // /task/view/5
    // -------------------------------------------------------

    const id =
      this.route.snapshot.paramMap.get('taskId');

    if (id) {

      this.taskId = Number(id);

    }


    // -------------------------------------------------------
    // GET QUERY PARAMETERS
    // -------------------------------------------------------

    const queryParams =
      this.route.snapshot.queryParamMap;


    this.currentPage =
      Number(
        queryParams.get('currentPage')
      ) || 1;


    this.searchText =
      queryParams.get('searchText') || '';


    this.statusIndex =
      Number(
        queryParams.get('statusIndex')
      ) || 0;


    this.page =
      Number(
        queryParams.get('page')
      ) || this.currentPage - 1;


    this.size =
      Number(
        queryParams.get('size')
      ) || 5;


    // -------------------------------------------------------
    // LOAD TASK
    // -------------------------------------------------------

    if (this.taskId) {

      this.getTaskDetails();

    } else {

      console.error(
        'Task ID not found in route.'
      );

    }

  }


  // =========================================================
  // GET TASK DETAILS
  // =========================================================

  getTaskDetails(): void {

    this.loading = true;


    this.dataprovider
      .getTaskById(this.taskId)
      .subscribe({

        next: (response: any) => {

          console.log(
            'Task details response:',
            response
          );


          if (
            response &&
            response.success &&
            response.data
          ) {

            this.task =
              response.data;


            // ------------------------------------------------
            // TRANSACTION HISTORY
            // ------------------------------------------------

            this.transactionHistory =
              response.data.transactionHistory || [];


            // ------------------------------------------------
            // SORT HISTORY
            // LATEST FIRST
            // ------------------------------------------------

            this.transactionHistory =
              this.transactionHistory.sort(
                (a: any, b: any) => {

                  const dateA =
                    this.parseDate(
                      a.entryDate
                    );

                  const dateB =
                    this.parseDate(
                      b.entryDate
                    );

                  return (
                    dateB.getTime() -
                    dateA.getTime()
                  );

                }
              );

          } else {

            this.task = null;

            console.error(
              'Task details not found:',
              response
            );

          }


          this.loading = false;

        },


        error: (error: any) => {

          console.error(
            'Failed to fetch task details:',
            error
          );


          this.task = null;

          this.loading = false;

        }

      });

  }


  // =========================================================
  // GET CLIENT NAME
  // =========================================================

  getClientName(
    clientId: number | null | undefined
  ): string {

    if (
      clientId === null ||
      clientId === undefined
    ) {

      return '-';

    }


    const client =
      this.clients.find(
        (item: any) =>
          Number(item.clientId) ===
          Number(clientId)
      );


    if (client) {

      return (
        client.name ||
        client.clientName ||
        '-'
      );

    }


    // -------------------------------------------------------
    // IF API ALREADY RETURNS CLIENT NAME
    // -------------------------------------------------------

    if (
      this.task &&
      this.task.clientName &&
      Number(this.task.clientId) ===
      Number(clientId)
    ) {

      return this.task.clientName;

    }


    return String(clientId);

  }


  // =========================================================
  // GET TASK CATEGORY NAME
  // =========================================================

  getTaskCategoryName(
    categoryId: number | null | undefined
  ): string {

    if (
      categoryId === null ||
      categoryId === undefined
    ) {

      return '-';

    }


    const category =
      this.taskCategories.find(
        (item: any) =>
          Number(
            item.taskCategoryId ??
            item.categoryId ??
            item.id
          ) ===
          Number(categoryId)
      );


    if (category) {

      return (
        category.name ||
        category.categoryName ||
        category.taskCategoryName ||
        '-'
      );

    }


    // -------------------------------------------------------
    // IF API ALREADY RETURNS CATEGORY NAME
    // -------------------------------------------------------

    if (
      this.task &&
      this.task.taskCategoryName &&
      Number(this.task.taskCategoryId) ===
      Number(categoryId)
    ) {

      return this.task.taskCategoryName;

    }


    return String(categoryId);

  }


  // =========================================================
  // GET USER NAME
  // =========================================================

  getUserName(
    userId: number | null | undefined
  ): string {

    if (
      userId === null ||
      userId === undefined
    ) {

      return '-';

    }


    const user =
      this.users.find(
        (item: any) =>
          Number(
            item.userId ??
            item.id
          ) ===
          Number(userId)
      );


    if (user) {

      if (user.firstName && user.lastName) {

        return (
          user.firstName +
          ' ' +
          user.lastName
        );

      }


      return (
        user.firstName ||
        user.name ||
        user.userName ||
        user.fullName ||
        '-'
      );

    }


    // -------------------------------------------------------
    // IF API ALREADY RETURNS ASSIGNED USER NAME
    // -------------------------------------------------------

    if (
      this.task &&
      Number(this.task.assignedTo) ===
      Number(userId)
    ) {

      if (this.task.assignedToName) {

        return this.task.assignedToName;

      }

      if (this.task.assignedUserName) {

        return this.task.assignedUserName;

      }

    }


    // -------------------------------------------------------
    // IF API ALREADY RETURNS ADDED BY NAME
    // -------------------------------------------------------

    if (
      this.task &&
      Number(this.task.addedBy) ===
      Number(userId)
    ) {

      if (this.task.addedByName) {

        return this.task.addedByName;

      }

    }


    return String(userId);

  }


  // =========================================================
  // FORMAT TASK DATE
  // =========================================================

  formatDate(
    value: any
  ): string {

    if (!value) {

      return '-';

    }


    // -------------------------------------------------------
    // LOCAL DATE YYYY-MM-DD
    // -------------------------------------------------------

    if (
      typeof value === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {

      const parts =
        value.split('-');

      return (
        parts[2] +
        '-' +
        parts[1] +
        '-' +
        parts[0]
      );

    }


    const date =
      new Date(value);


    if (
      isNaN(
        date.getTime()
      )
    ) {

      return String(value);

    }


    const day =
      String(
        date.getDate()
      ).padStart(2, '0');


    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, '0');


    const year =
      date.getFullYear();


    return (
      day +
      '-' +
      month +
      '-' +
      year
    );

  }


  // =========================================================
  // FORMAT DATE TIME
  // =========================================================

  formatDateTime(
    value: any
  ): string {

    if (!value) {

      return '-';

    }


    const date =
      new Date(value);


    if (
      isNaN(
        date.getTime()
      )
    ) {

      return String(value);

    }


    const day =
      String(
        date.getDate()
      ).padStart(2, '0');


    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, '0');


    const year =
      date.getFullYear();


    let hours =
      date.getHours();


    const minutes =
      String(
        date.getMinutes()
      ).padStart(2, '0');


    const seconds =
      String(
        date.getSeconds()
      ).padStart(2, '0');


    const ampm =
      hours >= 12
        ? 'PM'
        : 'AM';


    hours =
      hours % 12;


    hours =
      hours || 12;


    const hourString =
      String(hours)
        .padStart(2, '0');


    return (
      day +
      '-' +
      month +
      '-' +
      year +
      ' ' +
      hourString +
      ':' +
      minutes +
      ':' +
      seconds +
      ' ' +
      ampm
    );

  }


  // =========================================================
  // PRIORITY LABEL
  // =========================================================

  getPriorityLabel(
    priority: number | null | undefined
  ): string {

    if (
      priority === null ||
      priority === undefined
    ) {

      return '-';

    }


    switch (
      Number(priority)
    ) {

      case 1:
        return 'Low';

      case 2:
        return 'Medium';

      case 3:
        return 'High';

      case 4:
        return 'Critical';

      default:
        return String(priority);

    }

  }


  // =========================================================
  // PRIORITY CSS CLASS
  // =========================================================

  getPriorityClass(
    priority: number | null | undefined
  ): string {

    if (
      priority === null ||
      priority === undefined
    ) {

      return '';

    }


    switch (
      Number(priority)
    ) {

      case 1:
        return 'priority-low';

      case 2:
        return 'priority-medium';

      case 3:
        return 'priority-high';

      case 4:
        return 'priority-critical';

      default:
        return '';

    }

  }


  // =========================================================
  // STATUS LABEL
  // =========================================================

  getStatusLabel(
    status: number | null | undefined
  ): string {

    if (
      status === null ||
      status === undefined
    ) {

      return '-';

    }


    switch (
      Number(status)
    ) {

      case 0:
        return 'Inactive';

      case 1:
        return 'Open';

      case 2:
        return 'In Progress';

      case 3:
        return 'Completed';

      case 4:
        return 'Closed';

      case 5:
        return 'Cancelled';

      default:
        return String(status);

    }

  }


  // =========================================================
  // STATUS CSS CLASS
  // =========================================================

  getStatusClass(
    status: number | null | undefined
  ): string {

    if (
      status === null ||
      status === undefined
    ) {

      return '';

    }


    switch (
      Number(status)
    ) {

      case 0:
        return 'status-inactive';

      case 1:
        return 'status-open';

      case 2:
        return 'status-progress';

      case 3:
        return 'status-completed';

      case 4:
        return 'status-closed';

      case 5:
        return 'status-cancelled';

      default:
        return '';

    }

  }


  // =========================================================
  // PARSE DATE FOR SORTING
  // =========================================================

  private parseDate(
    value: any
  ): Date {

    if (!value) {

      return new Date(0);

    }


    const date =
      new Date(value);


    if (
      !isNaN(
        date.getTime()
      )
    ) {

      return date;

    }


    // -------------------------------------------------------
    // DD-MM-YYYY HH:mm:ss
    // -------------------------------------------------------

    const match =
      String(value).match(
        /^(\d{2})-(\d{2})-(\d{4})/
      );


    if (match) {

      return new Date(
        Number(match[3]),
        Number(match[2]) - 1,
        Number(match[1])
      );

    }


    return new Date(0);

  }


  // =========================================================
  // DOWNLOAD FILE
  // =========================================================

//   downloadFile(
//     fileName: string | null | undefined
//   ): void {

//     if (!fileName) {

//       return;

//     }


//     console.log(
//       'Download file:',
//       fileName
//     );


//     // -------------------------------------------------------
//     // IMPORTANT:
//     // Change this URL according to your backend.
//     // -------------------------------------------------------

//     // const fileUrl =
//     //   `/api/task/download/${encodeURIComponent(fileName)}`;

//      const fileUrl =
//     `${environment.baseurluploaded}task/pdf/${encodeURIComponent(fileName)}`;
// alert(fileUrl);


//     window.open(
//       fileUrl,
//       '_blank'
//     );

//   }
downloadFile(
  fileName: string | null | undefined,
  fileType: 'pdf' | 'zip'
): void {

  if (!fileName) {
    return;
  }

  let folder = '';

  if (fileType === 'pdf') {
    folder = 'tasks/pdf/';
  } else if (fileType === 'zip') {
    folder = 'tasks/zip/';
  }

  const fileUrl =
    `${environment.baseurluploaded}${folder}${encodeURIComponent(fileName)}`;

  console.log('Download/View URL:', fileUrl);

  window.open(fileUrl, '_blank');
}

  // =========================================================
  // CHECK FILE EXISTS
  // =========================================================

  hasFile(
    fileName: string | null | undefined
  ): boolean {

    return !!(
      fileName &&
      String(fileName).trim()
    );

  }


  // =========================================================
  // BACK TO INDEX PAGE
  // =========================================================

  backToIndexPage(): void {

    this.router.navigate(
      ['/task-index'],
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
            this.size || 5

        }
      }
    );

  }


  // =========================================================
  // EDIT TASK
  // =========================================================

  editTask(): void {

    if (!this.taskId) {

      return;

    }


    this.router.navigate(
      ['/task/edit', this.taskId],
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
            this.size

        }
      }
    );

  }


  // =========================================================
  // TRANSACTION HISTORY CHECK
  // =========================================================

  get hasTransactionHistory(): boolean {

    return (
      Array.isArray(
        this.transactionHistory
      ) &&
      this.transactionHistory.length > 0
    );

  }

  get hasAttachments(): boolean {
  return !!(
    this.task?.fileName1 ||
    this.task?.fileName2 ||
    this.task?.fileName3 ||
    this.task?.fileName4
  );
}
}