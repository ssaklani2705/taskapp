import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { Common } from '../../../classes/common';
import { DataProviderService } from '../../../service/data-provider.service';
import Swal from 'sweetalert2';
import { SessionStorageService } from '../../../service/session-storage.service';
import { SESSION_KEYS } from '../../../service/session-storage.keys';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MyDateAdapter } from '../../../classes/my-date-adapter';
import * as XLSX from 'xlsx';

interface Holiday {
  holidayId: number;
  name: string;
  startDate: string;
  endDate: string;
  status: number;
}

@Component({
  selector: 'app-holiday-index',
  imports: [CommonModule, FormsModule, RouterModule, MatCardModule, MatIconModule, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './holiday-index.html',
  styleUrl: './holiday-index.scss',
  providers: [
    {
      provide: DateAdapter,
      useClass: MyDateAdapter,
    },
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'en-GB',
    },
  ],
})
export class HolidayIndexComponent {
  holidays: Holiday[] = [];
  apiResponseHolidayDetails: any = {};
  searchQuery: string = '';
  search: string = '';
  currentPage: number = 1;
  page: number = 0;
  recordsPerPage: number = environment.recordsPerPage;

  size: number = environment.size;

  selectedStatus: string = '1';
  statusIndex: number = 1;
  createdBy: any;

  fromDate: Date | null = null;
  toDate: Date | null = null;

  common = new Common();
  holiday: any = {};
  userId: any;

  addPer: string = 'N';
  editPer: string = 'N';
  deletePer: string = 'N';
  viewPer: string = 'N';
  approvePer: string = 'N';
  adminApprovePer: string = 'N';
  exportExcelPer = 'Y';
  moduleName: string = '';
  showHeaderBar: boolean = true;

  filterKey = SESSION_KEYS.HOLIDAY_MASTER_FILTER;
  isPanelVisible = true;
  isLoading = false;

  showUploadModal = false;
  selectedFile: File | null = null;
  fileError = '';
  isUploading = false;

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  columns: {
    key: string;
    label: string;
    sortable: boolean;
  }[] = [
    {
      key: 'name',
      label: 'Holiday Name',
      sortable: true,
    },
    {
      key: 'startDate',
      label: 'Start Date',
      sortable: true,
    },
    {
      key: 'endDate',
      label: 'End Date',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
    },
  ];

  constructor(
    private dataprovider: DataProviderService,
    @Inject(PLATFORM_ID)
    private platformId: Object,
    private router: Router,
    private route: ActivatedRoute,
    private sessionService: SessionStorageService,
  ) {}

  ngOnInit() {
    this.sessionService.clearOtherSessions(this.filterKey);

    if (isPlatformBrowser(this.platformId)) {
      this.userId = sessionStorage.getItem('userId');
    }

    if (isPlatformBrowser(this.platformId)) {
      const storedModules = sessionStorage.getItem('selectedModuleDetail');
      if (storedModules) {
        const parsed = JSON.parse(storedModules);

        this.moduleName = parsed.name ?? '';
        this.addPer = parsed.addPer ?? 'N';
        this.editPer = parsed.editPer ?? 'N';
        this.deletePer = parsed.deletePer ?? 'N';
        this.viewPer = parsed.viewPer ?? 'N';
        this.approvePer = parsed.approvePer ?? 'N';
        this.adminApprovePer = parsed.adminApprovePer ?? 'N';
      }
    }

    let stateData: any = null;

    const nav = this.router.getCurrentNavigation();

    stateData = nav?.extras?.state;

    if (!stateData) {
      const saved = sessionStorage.getItem(this.filterKey);

      if (saved) {
        stateData = JSON.parse(saved);
      }
    }

    if (stateData) {
      this.currentPage = stateData.currentPage || 1;
      this.page = this.currentPage - 1;
      this.statusIndex = stateData.statusIndex || 0;
      this.search = stateData.searchText || '';
      this.size = stateData.size || this.size;
      this.recordsPerPage = this.size;
      this.searchQuery = this.search;
      this.selectedStatus = this.statusIndex ? String(this.statusIndex) : '';
    }

    this.getHolidayDetails();
  }

  togglePanel() {
    this.isPanelVisible = !this.isPanelVisible;
  }

  getHolidayDetails() {
    this.dataprovider.getHolidayDetails(this.page, this.size, this.statusIndex, this.search, this.fromDate, this.toDate).subscribe(
      (response) => {
        this.apiResponseHolidayDetails = response;
        this.holidays = response.data;
      },
      (error) => {
        console.error('Error fetching holiday details:', error);
      },
    );
  }

  onDateFilterChange(): void {
    console.log('From Date:', this.fromDate);
    console.log('To Date:', this.toDate);

    this.currentPage = 1;
    this.page = 0;

    this.getHolidayDetails();
  }

  get paginatedHolidays(): Holiday[] {
    return this.holidays;
  }

  goToPage(pageNumber: number) {
    if (pageNumber < 1 || pageNumber > this.totalPages) {
      return;
    }

    this.currentPage = pageNumber;
    this.page = pageNumber - 1;
    this.router
      .navigate(['/hodiday-index'], {
        replaceUrl: true,
        state: {
          currentPage: this.currentPage,
          statusIndex: this.statusIndex || 0,
          searchText: this.search || '',
          page: this.page,
          size: this.size || 5,
        },
      })
      .then(() => {
        this.getHolidayDetails();
      });
  }

  goToFirstPage() {
    this.goToPage(1);
  }

  goToLastPage() {
    this.goToPage(this.totalPages);
  }

  onSearch() {
    this.search = this.searchQuery.trim();
    this.statusIndex = this.selectedStatus === '' ? 0 : +this.selectedStatus;
    this.currentPage = 1;
    this.page = 0;

    this.router
      .navigate(['/hodiday-index'], {
        state: {
          currentPage: this.currentPage,
          statusIndex: this.statusIndex || 0,
          searchText: this.search || '',
          page: this.page,
          size: this.size || 5,
        },
      })
      .then(() => {
        this.getHolidayDetails();
      });
  }

  onChangeRecordsPerPage(): void {
    this.statusIndex = this.selectedStatus === '' ? 0 : +this.selectedStatus;
    this.search = this.searchQuery.trim();

    if (!this.search) {
      this.search = '';
      this.searchQuery = '';
    }

    this.currentPage = 1;
    this.page = 0;

    this.getHolidayDetails();
  }

  onDeleteHoliday(holidayId: any) {
    this.holiday.holidayId = holidayId;
    this.holiday.userId = this.userId ? Number(this.userId) : null;

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this holiday?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      customClass: {
        popup: 'small-confirm-popup',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.dataprovider.deleteHoliday(this.holiday).subscribe({
          next: (response) => {
            if (response.success) {
              Swal.fire('Deleted!', response.message, 'success');

              this.getHolidayDetails();
            } else {
              Swal.fire('Error', response.message, 'error');
            }
          },
          error: (err) => {
            console.error('error:', err);

            const message = err?.error?.message || 'Something went wrong';

            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: message,
            });
          },
        });
      }
    });
  }

  viewHoliday(holidayId: any) {
    const filterState = {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex,
      searchText: this.search,
      size: this.size,
    };

    sessionStorage.setItem(this.filterKey, JSON.stringify(filterState));

    this.router.navigate(['/view-holiday', holidayId], {
      state: filterState,
    });
  }

  editHoliday(holidayId: any) {
    const filterState = {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex,
      searchText: this.search,
      size: this.size,
    };

    sessionStorage.setItem(this.filterKey, JSON.stringify(filterState));

    this.router.navigate(['/edit-holiday', holidayId], {
      state: filterState,
    });
  }

  addHoliday() {
    const filterState = {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex,
      searchText: this.search,
      size: this.size,
    };

    sessionStorage.setItem(this.filterKey, JSON.stringify(filterState));

    this.router.navigate(['/add-holiday'], {
      state: filterState,
    });
  }

  pages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 5;
    const start = Math.max(1, current - delta);
    const end = Math.min(total, current + delta);
    const arr: number[] = [];

    for (let i = start; i <= end; i++) {
      arr.push(i);
    }

    return arr;
  }

  get recordSummary(): string {
    const totalRecords = this.apiResponseHolidayDetails.totalElements || 0;
    const startRecord = totalRecords === 0 ? 0 : (this.currentPage - 1) * this.recordsPerPage + 1;
    const endRecord = Math.min(this.currentPage * this.recordsPerPage, totalRecords);

    return `Page ${this.currentPage} of ${this.totalPages}, (${startRecord} - ${endRecord} of ${totalRecords} record${totalRecords > 1 ? 's' : ''})`;
  }

  get totalPages(): number {
    const total = this.apiResponseHolidayDetails.totalElements || 0;

    return Math.max(1, Math.ceil(total / this.recordsPerPage));
  }

  sortData(column: string): void {
    if (!column) {
      return;
    }

    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.holidays.sort((a: any, b: any) => {
      let valA = a[column];
      let valB = b[column];

      valA = valA ?? '';
      valB = valB ?? '';

      if (!isNaN(valA) && !isNaN(valB)) {
        valA = Number(valA);
        valB = Number(valB);
      } else {
        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();
      }

      if (valA < valB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }

      if (valA > valB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }

      return 0;
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = '1';
    this.fromDate = null;
    this.toDate = null;
    this.currentPage = 1;

    this.onSearch();
  }

  exportToExcel(): void {
    if (this.exportExcelPer !== 'Y') {
      return;
    }

    this.isLoading = true;

    this.dataprovider
      .getHolidayDetails(
        0, // first page
        999999, // fetch all records
        this.statusIndex,
        this.search,
        this.fromDate,
        this.toDate,
      )
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;

          const allHolidays: Holiday[] = response?.data || [];

          if (!allHolidays.length) {
            Swal.fire({
              icon: 'info',
              title: 'No Data',
              text: 'No holiday data available to export.',
              confirmButtonText: 'OK',
            });

            return;
          }

          const exportData = allHolidays.map((holiday: Holiday, index: number) => ({
            'Sr. No.': index + 1,
            'Holiday Name': holiday.name || '',
            'Start Date': holiday.startDate ? this.formatExcelDate(holiday.startDate) : '',
            'End Date': holiday.endDate ? this.formatExcelDate(holiday.endDate) : '',
            Status: this.common.getStatusLabel(holiday.status),
          }));

          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

          const headers = Object.keys(exportData[0]);

          worksheet['!cols'] = headers.map((header) => {
            let maxLength = header.length;

            exportData.forEach((row: any) => {
              const value = row[header];

              if (value !== null && value !== undefined) {
                maxLength = Math.max(maxLength, String(value).length);
              }
            });

            return {
              wch: Math.min(Math.max(maxLength + 2, 12), 40),
            };
          });

          const workbook: XLSX.WorkBook = XLSX.utils.book_new();

          XLSX.utils.book_append_sheet(workbook, worksheet, 'Holidays');

          const today = new Date();

          const dateString = `${today.getFullYear()}-` + `${String(today.getMonth() + 1).padStart(2, '0')}-` + `${String(today.getDate()).padStart(2, '0')}`;

          const fileName = `Holidays_All_${dateString}.xlsx`;

          XLSX.writeFile(workbook, fileName);

          Swal.fire({
            icon: 'success',
            title: 'Export Successful',
            text: `${allHolidays.length} holiday(s) exported successfully.`,
            confirmButtonText: 'OK',
          });
        },

        error: (error) => {
          this.isLoading = false;

          console.error('Failed to fetch holiday data for export:', error);

          Swal.fire({
            icon: 'error',
            title: 'Export Failed',
            text: 'Unable to export holiday data. Please try again.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d33',
          });
        },
      });
  }

  private formatExcelDate(date: any): string {
    if (!date) {
      return '-';
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return '-';
    }

    const day = String(parsedDate.getDate()).padStart(2, '0');
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const year = parsedDate.getFullYear();

    return `${day}-${month}-${year}`;
  }

  openUploadModal(): void {
    this.selectedFile = null;
    this.fileError = '';
    this.isUploading = false;
    this.showUploadModal = true;
  }

  closeUploadModal(): void {
    if (this.isUploading) {
      return;
    }

    this.showUploadModal = false;
    this.selectedFile = null;
    this.fileError = '';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.fileError = '';
    this.selectedFile = null;

    if (!input.files || input.files.length === 0) {
      this.fileError = 'Please select an Excel file.';
      return;
    }

    const file = input.files[0];

    const validExtensions = ['xls', 'xlsx'];

    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!extension || !validExtensions.includes(extension)) {
      this.fileError = 'Invalid file type. Only .xls or .xlsx files are allowed.';

      input.value = '';

      return;
    }

    this.selectedFile = file;
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
    this.fileError = '';
  }

  submitUpload(): void {
    if (!this.selectedFile) {
      this.fileError = 'Excel file is required';

      return;
    }

    const userId = this.userId;

    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: 'User information is missing. Please login again.',
        confirmButtonColor: '#d33',
      });

      return;
    }

    const formData = new FormData();

    formData.append('file', this.selectedFile, this.selectedFile.name);

    formData.append('userId', String(userId));

    this.isUploading = true;
    this.fileError = '';

    this.dataprovider.uploadHolidayExcel(this.selectedFile, this.userId).subscribe({
      next: (res: any) => {
        this.isUploading = false;

        console.log('Holiday Excel Upload Response:', res);

        if (!res?.success) {
          Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: res?.message || 'Something went wrong during holiday upload.',
            confirmButtonColor: '#d33',
          });

          return;
        }

        this.showUploadModal = false;
        this.selectedFile = null;

        if (res.downloadFilePath) {
          const url = res.downloadFilePath;

          // Automatically download failed records
          const link = document.createElement('a');
          link.href = url;
          link.download = '';
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          Swal.fire({
            icon: 'warning',
            title: 'Partial Upload',
            text: `${res.message || 'Some holidays could not be uploaded.'} Failed records have been downloaded.`,
            confirmButtonText: 'OK',
          }).then(() => {
            this.getHolidayDetails();
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Upload Successful',
            text: res.message || 'Holiday list uploaded successfully!',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6',
          }).then(() => {
            this.getHolidayDetails();
          });
        }
      },

      error: (error) => {
        console.error('Holiday Excel Upload Error:', error);

        this.isUploading = false;

        Swal.fire({
          icon: 'error',
          title: 'Upload Error',
          text: error?.error?.message || 'Upload failed. Please check your Excel file and try again.',
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK',
        });
      },
    });
  }

  getStatusClass(status: number | string): string {
    switch (+status) {
      case 1:
        return 'status-active';

      case 2:
        return 'status-inactive';

      case 3:
        return 'status-deleted';

      default:
        return '';
    }
  }

  getStatusLabel(status: number | string): string {
    switch (+status) {
      case 1:
        return 'Active';
      case 2:
        return 'Inactive';
      case 3:
        return 'Deleted';
      default:
        return 'Unknown';
    }
  }
}
