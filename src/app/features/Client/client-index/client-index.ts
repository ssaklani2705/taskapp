import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataProviderService } from '../../../service/data-provider.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { SESSION_KEYS } from '../../../service/session-storage.keys';
import { SessionStorageService } from '../../../service/session-storage.service';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MyDateAdapter } from '../../../classes/my-date-adapter';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';

interface Client {
  clientId: number;
  name: string;
  code: string;
  pan: string;
  status: number;
  gstFlag: number | string;
  gstNo: string;
  stateId: number;
  stateName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  pincode: string;
  contactName: string;
  contactEmail: string;
  emails: string;
  startDate: string;
  monthlyCharge: number;
  outstanding: number;
  name1: string;
  emailId1: string;
  name2: string;
  emailId2: string;
  name3: string;
  emailId3: string;
  managerId: number;
  managerName: string;
  planId: number;
  planName: string;
  userId: number;
  regdate: string;
  moddate: string;
  taxFlag: number | string;
  location: string;
}

@Component({
  selector: 'app-client-index',
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatIcon,
    MatDivider,
  ],
  templateUrl: './client-index.html',
  styleUrl: './client-index.scss',
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
export class ClientIndex {
  clients: Client[] = [];
  userId!: number;
  isLoading = false;

  currentPage = 1;
  page = 0;
  size = 5;
  totalRecords = 0;
  totalPages = 1;

  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  isPanelVisible = true;

  addPer: string = 'N';
  editPer: string = 'N';
  deletePer: string = 'N';
  viewPer: string = 'N';
  approvePer: string = 'N';
  adminApprovePer: string = 'N';
  moduleName: string = '';
  showHeaderBar: boolean = true;
  exportExcel: string = 'N';

  searchQuery = '';
  search = '';
  selectedStatus = '1';
  statusIndex = 1;

  stateId = 0;
  managerId = 0;
  planId = 0;

  selectedGstFlag: string = '';
  selectedTaxFlag: string = '';

  gstFlag: number | null = null;
  taxFlag: number | null = null;

  fromDate: Date | null = null;
  toDate: Date | null = null;

  states: any[] = [];
  managers: any[] = [];
  plans: any[] = [];

  filterKey = SESSION_KEYS.CLIENT_MASTER_FILTER;

  showUploadModal = false;
  selectedFile: File | null = null;
  fileError = '';
  isUploading = false;

  constructor(
    private dataprovider: DataProviderService,
    private router: Router,
    @Inject(PLATFORM_ID)
    private platformId: Object,
    private sessionService: SessionStorageService,
  ) {}

  ngOnInit(): void {
    this.sessionService.clearOtherSessions(this.filterKey);

    if (isPlatformBrowser(this.platformId)) {
      const storedUserId = sessionStorage.getItem('userId');

      if (storedUserId) {
        this.userId = Number(storedUserId);
      }
    }

    if (isPlatformBrowser(this.platformId)) {
      const storedModules = sessionStorage.getItem('selectedModuleDetail');

      if (storedModules) {
        try {
          const parsed = JSON.parse(storedModules);

          this.moduleName = parsed.name ?? '';
          this.addPer = parsed.addPer ?? 'N';
          this.editPer = parsed.editPer ?? 'N';
          this.deletePer = parsed.deletePer ?? 'N';
          this.viewPer = parsed.viewPer ?? 'N';
          this.approvePer = parsed.approvePer ?? 'N';
          this.adminApprovePer = parsed.adminApprovePer ?? 'N';
          this.exportExcel = parsed.exportExcel ?? 'N';
        } catch (error) {
          console.error('Invalid selectedModuleDetail:', error);
        }
      }
    }

    this.restoreFilterState();
    this.loadStates();
    this.loadManagers();
    this.loadPlan();
    this.getClientDetails();
  }

  getClientDetails(): void {
    const clientName = '';
    const clientCode = '';
    const contactName = '';
    const contactEmail = '';

    this.dataprovider
      .getClientDetails(
        this.page,
        this.size,
        this.statusIndex,
        this.managerId,
        this.stateId,
        this.gstFlag,
        this.taxFlag,
        this.planId,
        this.formatDate(this.fromDate),
        this.formatDate(this.toDate),
        clientName,
        clientCode,
        contactName,
        contactEmail,
        this.search,
        this.sortColumn || 'name',
        this.sortDirection,
      )
      .subscribe({
        next: (response: any) => {
          console.log('Client Details Response:', response);

          this.clients = response.data || [];

          this.totalRecords = response.totalElements || 0;
          this.totalPages = response.totalPages || 1;
          this.currentPage = (response.currentPage ?? this.page) + 1;
          this.page = response.currentPage ?? this.page;
          this.size = response.pageSize ?? this.size;
        },

        error: (error) => {
          console.error('Error fetching client details:', error);

          this.clients = [];
          this.totalRecords = 0;
          this.totalPages = 1;
        },
      });
  }

  loadStates(): void {
    this.dataprovider.getStates().subscribe({
      next: (response: any) => {
        console.log('States:', response);

        this.states = response?.data || response || [];
      },
      error: (error) => {
        console.error('Error loading states:', error);
        this.states = [];
      },
    });
  }

  loadManagers(): void {
    this.dataprovider.getManagers().subscribe({
      next: (response: any) => {
        console.log('Active Managers:', response);

        this.managers = response?.data || response || [];
      },
      error: (error) => {
        console.error('Error loading managers:', error);
        this.managers = [];
      },
    });
  }

  loadPlan(): void {
    this.dataprovider.getPlan().subscribe({
      next: (response: any) => {
        this.plans = response?.data || response || [];
      },
      error: (error) => {
        console.error('Error loading plans:', error);
        this.plans = [];
      },
    });
  }

  private formatDate(date: Date | null): string {
    if (!date) {
      return '';
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  private parseDate(dateString: string): Date | null {
    if (!dateString) {
      return null;
    }

    const parts = dateString.split('-');

    if (parts.length !== 3) {
      return null;
    }

    const day = Number(parts[0]);
    const month = Number(parts[1]);
    const year = Number(parts[2]);

    if (!day || !month || !year) {
      return null;
    }

    return new Date(year, month - 1, day);
  }

  onStateChange(): void {
    this.currentPage = 1;
    this.page = 0;

    this.saveFilterState();

    this.getClientDetails();
  }

  onManagerChange(): void {
    this.currentPage = 1;
    this.page = 0;

    this.saveFilterState();

    this.getClientDetails();
  }

  onPlanChange(): void {
    this.currentPage = 1;
    this.page = 0;

    this.saveFilterState();

    this.getClientDetails();
  }

  clearFilter(): void {
    this.searchQuery = '';
    this.search = '';

    this.selectedStatus = '';
    this.statusIndex = 0;

    this.selectedGstFlag = '';
    this.selectedTaxFlag = '';

    this.gstFlag = null;
    this.taxFlag = null;

    this.fromDate = null;
    this.toDate = null;

    this.stateId = 0;
    this.managerId = 0;
    this.planId = 0;

    this.currentPage = 1;
    this.page = 0;

    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(this.filterKey);
    }

    this.getClientDetails();
  }

  addClient() {
    const filterState = {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex,
      searchText: this.search,
      size: this.size,
      stateId: this.stateId,
      managerId: this.managerId,
      planId: this.planId,
      gstFlag: this.gstFlag,
      taxFlag: this.taxFlag,
      fromDate: this.formatDate(this.fromDate),
      toDate: this.formatDate(this.toDate),
    };

    sessionStorage.setItem(this.filterKey, JSON.stringify(filterState));

    this.router.navigate(['/add-client'], {
      state: filterState,
    });
  }

  viewClient(ClientId: any) {
    const filterState = {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex,
      searchText: this.search,
      size: this.size,
      stateId: this.stateId,
      managerId: this.managerId,
      planId: this.planId,
      gstFlag: this.gstFlag,
      taxFlag: this.taxFlag,
      fromDate: this.formatDate(this.fromDate),
      toDate: this.formatDate(this.toDate),
    };

    sessionStorage.setItem(this.filterKey, JSON.stringify(filterState));

    this.router.navigate(['/view-client', ClientId], {
      state: filterState,
    });
  }

  editClient(ClientId: any) {
    const filterState = {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex,
      searchText: this.search,
      size: this.size,
      stateId: this.stateId,
      managerId: this.managerId,
      planId: this.planId,
      gstFlag: this.gstFlag,
      taxFlag: this.taxFlag,
      fromDate: this.formatDate(this.fromDate),
      toDate: this.formatDate(this.toDate),
    };

    sessionStorage.setItem(this.filterKey, JSON.stringify(filterState));

    this.router.navigate(['/edit-client', ClientId], {
      state: filterState,
    });
  }

  onDeleteUser(clientId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this client?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
    }).then((result) => {
      if (result.isConfirmed) {
        this.dataprovider.deleteClient(clientId, this.userId).subscribe({
          next: (response: any) => {
            if (response?.success) {
              Swal.fire({
                title: 'Deleted!',
                text: response.message || 'Client deleted successfully.',
                icon: 'success',
                confirmButtonText: 'OK',
              }).then(() => {
                this.getClientDetails();
              });
            } else {
              Swal.fire({
                title: 'Error',
                text: response?.message || 'Failed to delete client.',
                icon: 'error',
                confirmButtonText: 'OK',
              });
            }
          },

          error: (error) => {
            console.error('Error deleting client:', error);

            Swal.fire({
              title: 'Error',
              text: error?.error?.message || 'Something went wrong while deleting the client.',
              icon: 'error',
              confirmButtonText: 'OK',
            });
          },
        });
      }
    });
  }

  onStatusChange(): void {
    this.statusIndex = this.selectedStatus === '' ? 0 : Number(this.selectedStatus);
    this.search = this.searchQuery.trim();
    this.currentPage = 1;
    this.page = 0;
    this.saveFilterState();

    this.getClientDetails();
  }

  onGstChange(): void {
    this.gstFlag = this.selectedGstFlag === '' ? null : Number(this.selectedGstFlag);

    this.search = this.searchQuery.trim();
    this.currentPage = 1;
    this.page = 0;

    this.saveFilterState();
    this.getClientDetails();
  }

  onTaxChange(): void {
    this.taxFlag = this.selectedTaxFlag === '' ? null : Number(this.selectedTaxFlag);

    this.search = this.searchQuery.trim();
    this.currentPage = 1;
    this.page = 0;

    this.saveFilterState();
    this.getClientDetails();
  }

  onSearch(): void {
    this.search = this.searchQuery.trim();
    this.statusIndex = this.selectedStatus === '' ? 0 : Number(this.selectedStatus);
    this.currentPage = 1;
    this.page = 0;
    this.saveFilterState();

    this.getClientDetails();
  }

  private saveFilterState(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const filterState = {
      currentPage: this.currentPage,
      statusIndex: this.statusIndex,
      searchText: this.search,
      size: this.size,
      stateId: this.stateId,
      managerId: this.managerId,
      planId: this.planId,
      gstFlag: this.gstFlag,
      taxFlag: this.taxFlag,
      fromDate: this.formatDate(this.fromDate),
      toDate: this.formatDate(this.toDate),
    };

    sessionStorage.setItem(this.filterKey, JSON.stringify(filterState));
  }

  togglePanel(): void {
    this.isPanelVisible = !this.isPanelVisible;
  }

  goToFirstPage(): void {
    if (this.currentPage !== 1) {
      this.goToPage(1);
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  goToLastPage(): void {
    if (this.currentPage !== this.totalPages) {
      this.goToPage(this.totalPages);
    }
  }

  pages(): number[] {
    const pages: number[] = [];

    if (this.totalPages <= 0) {
      return pages;
    }

    if (this.totalPages <= 5) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }

      return pages;
    }

    let start = Math.max(1, this.currentPage - 2);

    let end = Math.min(this.totalPages, start + 4);

    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  goToPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages) {
      return;
    }

    if (pageNumber === this.currentPage) {
      return;
    }

    this.currentPage = pageNumber;
    this.page = pageNumber - 1;

    this.saveFilterState();

    this.getClientDetails();
  }

  onChangeRecordsPerPage(): void {
    this.size = Number(this.size);

    if (!this.size || this.size < 1) {
      this.size = 5;
    }

    this.currentPage = 1;
    this.page = 0;

    this.saveFilterState();

    this.getClientDetails();
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

    this.dataprovider.uploadClientsExcel(this.selectedFile, this.userId).subscribe({
      next: (res: any) => {
        this.isUploading = false;

        console.log('Client Excel Upload Response:', res);

        if (!res?.success) {
          Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: res?.message || 'Something went wrong during client upload.',
            confirmButtonColor: '#d33',
          });

          return;
        }

        this.showUploadModal = false;
        this.selectedFile = null;

        if (res.downloadFilePath) {
          const url = res.downloadFilePath;

          Swal.fire({
            icon: 'warning',
            title: 'Partial Upload',
            html: `
            <p>${res.message || 'Some clients could not be uploaded.'}</p>

            <p>
              Failed records have been exported.
            </p>

            <a
              href="${url}"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download Failed Records
            </a>
          `,
            confirmButtonText: 'OK',
          }).then(() => {
            this.getClientDetails();
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Upload Successful',
            text: res.message || 'Clients uploaded successfully!',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6',
          }).then(() => {
            this.getClientDetails();
          });
        }
      },

      error: (error) => {
        console.error('Client Excel Upload Error:', error);

        this.isUploading = false;

        Swal.fire({
          icon: 'error',
          title: 'Upload Error',
          text:
            error?.error?.message || 'Upload failed. Please check your Excel file and try again.',
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK',
        });
      },
    });
  }

  exportToExcel(): void {
    if (this.exportExcel !== 'Y') {
      return;
    }

    this.isLoading = true;

    this.dataprovider
      .getClientDetails(
        0, // first page
        999999, // fetch all records
        this.statusIndex,
        this.managerId,
        this.stateId,
        this.gstFlag,
        this.taxFlag,
        this.planId,
        this.formatDate(this.fromDate),
        this.formatDate(this.toDate),
        '', // clientName
        '', // clientCode
        '', // contactName
        '', // contactEmail
        this.search,
        this.sortColumn || 'name',
        this.sortDirection,
      )
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;

          const allClients: Client[] = response?.data || [];

          if (!allClients.length) {
            Swal.fire({
              icon: 'info',
              title: 'No Data',
              text: 'No client data available to export.',
              confirmButtonText: 'OK',
            });

            return;
          }

          const exportData = allClients.map((client: Client, index: number) => ({
            'Sr No': index + 1,
            'Society Manager': client.managerName || '',
            'Client Name': client.name || '',
            'Client Code': client.code || '',
            PAN: client.pan || '',
            'GST Applicable': client.gstFlag ?? '',
            'GST Number': client.gstNo || '',
            'Tax Payable': client.taxFlag ?? '',
            'Address Line 1': client.addressLine1 || '',
            'Address Line 2': client.addressLine2 || '',
            City: client.city || '',
            State: client.stateName || '',
            Location: client.location || '',
            Pincode: client.pincode || '',
            'Contact Name': client.contactName || '',
            'Contact Email': client.contactEmail || '',
            'Contact Person 1 Name': client.name1 || '',
            'Contact Person 1 Email': client.emailId1 || '',
            'Contact Person 2 Name': client.name2 || '',
            'Contact Person 2 Email': client.emailId2 || '',
            'Contact Person 3 Name': client.name3 || '',
            'Contact Person 3 Email': client.emailId3 || '',
            Emails: client.emails || '',
            'Start Date': client.startDate || '',
            Plan: client.planName || '',
            Outstanding: client.outstanding ?? '',
            Status: this.getStatusLabel(client.status),
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

          XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');

          const date = new Date().toISOString().slice(0, 10);

          const fileName = `Clients_All_${date}.xlsx`;

          XLSX.writeFile(workbook, fileName);

          Swal.fire({
            icon: 'success',
            title: 'Export Successful',
            text: `${allClients.length} client(s) exported successfully.`,
            confirmButtonText: 'OK',
          });
        },

        error: (error) => {
          this.isLoading = false;

          console.error('Failed to fetch client data for export:', error);

          Swal.fire({
            icon: 'error',
            title: 'Export Failed',
            text: 'Unable to export client data. Please try again.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d33',
          });
        },
      });
  }

  get recordSummary(): string {
    if (this.totalRecords === 0) {
      return 'Page 0 of 0, (0 - 0 of 0 records)';
    }

    const start = (this.currentPage - 1) * this.size + 1;

    const end = Math.min(this.currentPage * this.size, this.totalRecords);

    return (
      `Page ${this.currentPage} of ${this.totalPages}, ` +
      `(${start} - ${end} of ${this.totalRecords} records)`
    );
  }

  private restoreFilterState(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const stored = sessionStorage.getItem(this.filterKey);

    if (!stored) {
      return;
    }

    try {
      const filterState = JSON.parse(stored);

      if (filterState.currentPage) {
        this.currentPage = Number(filterState.currentPage);
      }

      this.page = this.currentPage - 1;

      if (filterState.statusIndex !== undefined) {
        this.statusIndex = Number(filterState.statusIndex);
      }

      if (filterState.searchText !== undefined) {
        this.search = filterState.searchText;

        this.searchQuery = filterState.searchText;
      }

      if (filterState.size) {
        this.size = Number(filterState.size);
      }

      if (filterState.stateId !== undefined) {
        this.stateId = Number(filterState.stateId);
      }

      if (filterState.managerId !== undefined) {
        this.managerId = Number(filterState.managerId);
      }

      if (this.statusIndex > 0) {
        this.selectedStatus = String(this.statusIndex);
      }

      if (filterState.planId !== undefined) {
        this.planId = Number(filterState.planId);
      }

      if (filterState.gstFlag !== undefined) {
        this.gstFlag = filterState.gstFlag === null ? null : Number(filterState.gstFlag);

        this.selectedGstFlag = this.gstFlag === null ? '' : String(this.gstFlag);
      }

      if (filterState.taxFlag !== undefined) {
        this.taxFlag = filterState.taxFlag === null ? null : Number(filterState.taxFlag);

        this.selectedTaxFlag = this.taxFlag === null ? '' : String(this.taxFlag);
      }

      if (filterState.fromDate) {
        this.fromDate = this.parseDate(filterState.fromDate);
      }

      if (filterState.toDate) {
        this.toDate = this.parseDate(filterState.toDate);
      }
    } catch (error) {
      console.error('Error restoring filter state:', error);
    }
  }

  getStatusClass(status: number | string): string {
    switch (+status) {
      case 1:
        return 'status-badge active';
      case 2:
        return 'status-badge inactive';
      case 3:
        return 'status-badge deleted';
      default:
        return 'status-badge';
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

  columns = [
    {
      key: 'name',
      label: 'Client Name',
      sortable: true,
    },
    {
      key: 'code',
      label: 'Client Code',
      sortable: true,
    },
    {
      key: 'managerName',
      label: 'Society Manager',
      sortable: true,
    },
    {
      key: 'city',
      label: 'City',
      sortable: true,
    },
    {
      key: 'stateName',
      label: 'State',
      sortable: true,
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
    },
    {
      key: 'contactName',
      label: 'Contact Name',
      sortable: true,
    },
    {
      key: 'contactEmail',
      label: 'Contact Email',
      sortable: true,
    },

    {
      key: 'startDate',
      label: 'Start Date',
      sortable: true,
    },

    {
      key: 'planName',
      label: 'Plan',
      sortable: true,
    },

    {
      key: 'outstanding',
      label: 'Outstanding',
      sortable: true,
    },
    {
      key: 'gstFlag',
      label: 'GST Applicable',
      sortable: true,
    },
    {
      key: 'taxFlag',
      label: 'Tax Payable',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
    },
  ];

  sortData(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;

      this.sortDirection = 'asc';
    }

    this.clients = [...this.clients].sort((a: any, b: any) => {
      let valueA = a[column];

      let valueB = b[column];

      if (column === 'status') {
        valueA = Number(valueA);

        valueB = Number(valueB);
      }

      if (valueA === null || valueA === undefined) {
        valueA = '';
      }

      if (valueB === null || valueB === undefined) {
        valueB = '';
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        valueA = valueA.toLowerCase();

        valueB = valueB.toLowerCase();
      }

      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }

      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }

      return 0;
    });
  }
}
