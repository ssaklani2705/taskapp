import { AfterViewInit, Component, ElementRef, HostListener, Inject, OnInit, PLATFORM_ID, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, MatNativeDateModule, DateAdapter } from '@angular/material/core';
import { DataProviderService, DepartmentDTO, DesignationDTO, TaskCategoryDTO } from '../../../service/data-provider.service';
import { MyDateAdapter } from '../../../classes/my-date-adapter';

declare var $: any;

@Component({
  selector: 'app-add-team',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './add-team.html',
  styleUrl: './add-team.scss',
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    { provide: DateAdapter, useClass: MyDateAdapter },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
  ],
})
export class AddTeam implements OnInit, AfterViewInit {
  userForm!: FormGroup;

  isEditMode = false;
  userId = 0;
  createdBy: any;
  isSubmitting = false;

  currentPage = 1;
  searchText = '';
  statusIndex = 0;
  size = 10;

  minDate: Date = new Date();

  permissionActions: string[] = ['Add', 'Edit', 'Delete', 'Approve', 'Admin Approval', 'View Only', 'Export Excel'];

  permissionApiMap: any = {
    Add: 'addPer',
    Edit: 'editPer',
    Delete: 'deletePer',
    Approve: 'approvePer',
    'Admin Approval': 'adminApprovePer',
    'View Only': 'viewPer',
    'Export Excel': 'exportExcel',
  };

  weeklyOffOptions = [
    { id: 1, label: 'Sunday' },
    { id: 2, label: 'Monday' },
    { id: 3, label: 'Tuesday' },
    { id: 4, label: 'Wednesday' },
    { id: 5, label: 'Thursday' },
    { id: 6, label: 'Friday' },
    { id: 7, label: 'Saturday' },
  ];

  typeGroupMap: { [key: number]: string } = {
    1: 'Masters',
    2: 'Activity',
    3: 'Reports - 1',
  };

  groupedModules: { type: number; modules: any[] }[] = [];
  permissions: any = {};
  selectAllRows: any = {};
  originalPermissions: any = {};
  originalSelectAllRows: any = {};

  // ---------- Dropdown data ----------
  departmentList: DepartmentDTO[] = [];
  designationList: DesignationDTO[] = [];
  categoryList: TaskCategoryDTO[] = [];

  // ---------- Department multi-select ----------
  selectedDepartmentIds: number[] = [];
  showDepartmentDropdown = false;
  showDepartmentValidation = false;

  // ---------- Category multi-select ----------
  selectedCategoryIds: number[] = [];
  showCategoryDropdown = false;
  showCategoryValidation = false;
  categoriesLoading = false;

  private isLoadingUserDetails = false;

  @ViewChild('departmentDropdown') departmentDropdown!: ElementRef;
  @ViewChild('categoryDropdown') categoryDropdown!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private dataProvider: DataProviderService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.minDate = today;
    this.createForm();
  }

  private createForm(): void {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      expiryDate: [null, Validators.required],
      password: [''],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      telephone: [''],
      status: [1, Validators.required],
      isAdmin: [false],
      isHod: [false],
      weeklyOff: [null],
      desigmationId: [null, Validators.required],
    });

    this.userForm.get('isAdmin')?.valueChanges.subscribe((isAdmin: boolean) => {
      if (isAdmin) {
        this.clearAllPermissions();
      }
    });

    // this.userForm.get('isHod')?.valueChanges.subscribe((isHod: boolean) => {
    //   if (!isHod && this.selectedDepartmentIds.length > 1) {
    //     this.selectedDepartmentIds = [this.selectedDepartmentIds[0]];
    //     this.showDepartmentDropdown = false;

    //     this.loadCategories();
    //   }
    // });

    // this.userForm.get('isHod')?.valueChanges.subscribe((isHod: boolean) => {
    //   if (isHod) {
    //     this.loadCategories(false);
    //   } else {
    //     if (this.selectedDepartmentIds.length > 1) {
    //       this.selectedDepartmentIds = [this.selectedDepartmentIds[0]];
    //     }

    //     this.showDepartmentDropdown = false;

    //     this.loadCategories();
    //   }
    // });

    this.userForm.get('isHod')?.valueChanges.subscribe((isHod: boolean) => {
      if (this.isLoadingUserDetails) {
        return;
      }

      if (isHod) {
        this.showDepartmentDropdown = false;

        if (this.selectedDepartmentIds.length > 0) {
          this.loadCategories(false);
        }
      } else {
        this.selectedDepartmentIds = [];

        this.selectedCategoryIds = [];
        this.categoryList = [];

        this.showDepartmentDropdown = false;
        this.showCategoryDropdown = false;

        this.showDepartmentValidation = false;
        this.showCategoryValidation = false;
      }
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.createdBy = sessionStorage.getItem('userId');
    }

    this.readFilterState();

    const id = this.route.snapshot.paramMap.get('userId');

    this.loadDepartments();
    this.loadDesignations();

    if (id) {
      this.isEditMode = true;
      this.userId = Number(id);
      this.loadUserDetails();
    } else {
      this.isEditMode = false;
      this.userId = 0;
      this.setupAddMode();
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if ($('#fromDatePicker').length) {
        $('#fromDatePicker')
          .datepicker({
            format: 'dd-mm-yyyy',
            autoclose: true,
            startDate: this.minDate,
          })
          .on('changeDate', (e: any) => {
            this.userForm.get('expiryDate')?.setValue(e.format('dd-mm-yyyy'));
            this.userForm.get('expiryDate')?.markAsDirty();
          });
      }
    }, 100);
  }

  private setupAddMode(): void {
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();

    const defaultDate = new Date(2050, 11, 31);
    defaultDate.setHours(0, 0, 0, 0);

    this.userForm.patchValue({
      status: 1,
      isAdmin: false,
      expiryDate: defaultDate,
    });

    this.loadPermissionModules(0);
  }

  private parseIdList(value: any): number[] {
    if (Array.isArray(value)) {
      return value.map((id: any) => Number(id)).filter((id: number) => !isNaN(id));
    }

    if (typeof value === 'string' && value.trim() !== '') {
      return value
        .split(',')
        .map((id: string) => Number(id.trim()))
        .filter((id: number) => !isNaN(id));
    }

    if (typeof value === 'number') {
      return [value];
    }

    return [];
  }

  private parseWeeklyOff(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    if (Array.isArray(value)) {
      return value.length ? Number(value[0]) : null;
    }

    if (typeof value === 'string') {
      const firstValue = value.split(',')[0].trim();
      const id = Number(firstValue);

      return isNaN(id) ? null : id;
    }

    const id = Number(value);

    return isNaN(id) ? null : id;
  }

  // private loadUserDetails(): void {
  //   this.dataProvider.getUserManagementDetailsById(this.userId).subscribe({
  //     next: (response: any) => {
  //       if (!response) {
  //         alert('User details not found.');
  //         this.backToIndexPage();
  //         return;
  //       }

  //       this.userForm.get('password')?.clearValidators();
  //       this.userForm.get('password')?.updateValueAndValidity();

  //       this.selectedCategoryIds = this.parseIdList(response.taskcategoryIds);
  //       this.selectedDepartmentIds = this.parseIdList(response.departmentIds ?? response.departmentId);

  //       const isHod = response.isHod === 'Y' || this.selectedDepartmentIds.length > 1;

  //       this.userForm.patchValue({
  //         name: response.firstName || '',
  //         email: response.email || '',
  //         mobile: response.mobileNo || '',
  //         telephone: response.telephone && response.telephone !== 'NA' ? response.telephone : '',
  //         expiryDate: this.parseExpiryDate(response.expiryDate),
  //         status: Number(response.status) || 1,
  //         isAdmin: response.permission === 'Y',
  //         isHod: isHod,
  //         weeklyOff: this.parseWeeklyOff(response.weeklyOffIds ?? response.weeklyOff),
  //         desigmationId: response.designationId || null,
  //       });

  //       if (this.selectedDepartmentIds.length > 0) {
  //         this.loadCategories(false);
  //       } else {
  //         this.categoryList = [];
  //       }

  //       if (response.module) {
  //         this.buildPermissionGroups(response.module);
  //       }
  //     },

  //     error: (err) => {
  //       console.error('Failed to fetch user details', err);
  //       alert('Failed to load user details.');
  //       this.backToIndexPage();
  //     },
  //   });
  // }

  private loadUserDetails(): void {
    this.isLoadingUserDetails = true;

    this.dataProvider.getUserManagementDetailsById(this.userId).subscribe({
      next: (response: any) => {
        if (!response) {
          this.isLoadingUserDetails = false;

          alert('User details not found.');
          this.backToIndexPage();
          return;
        }

        this.userForm.get('password')?.clearValidators();
        this.userForm.get('password')?.updateValueAndValidity();

        this.selectedDepartmentIds = this.parseIdList(response.departmentIds ?? response.departmentId);

        this.selectedCategoryIds = this.parseIdList(response.taskcategoryIds);

        console.log('EDIT - Department IDs:', this.selectedDepartmentIds);
        console.log('EDIT - Category IDs:', this.selectedCategoryIds);

        const isHod = response.isHod === 'Y' || this.selectedDepartmentIds.length > 1;

        this.userForm.patchValue({
          name: response.firstName || '',
          email: response.email || '',
          mobile: response.mobileNo || '',
          telephone: response.telephone && response.telephone !== 'NA' ? response.telephone : '',
          expiryDate: this.parseExpiryDate(response.expiryDate),
          status: Number(response.status) || 1,
          isAdmin: response.permission === 'Y',
          isHod: isHod,
          weeklyOff: this.parseWeeklyOff(response.weeklyOffIds ?? response.weeklyOff),
          desigmationId: response.designationId || null,
        });

        if (this.selectedDepartmentIds.length > 0) {
          this.loadCategoriesForEdit();
        } else {
          this.categoryList = [];
        }

        if (response.module) {
          this.buildPermissionGroups(response.module);
        }

        this.isLoadingUserDetails = false;
      },

      error: (err) => {
        this.isLoadingUserDetails = false;

        console.error('Failed to fetch user details', err);

        alert('Failed to load user details.');

        this.backToIndexPage();
      },
    });
  }

  private loadCategoriesForEdit(): void {
    this.categoriesLoading = true;

    this.dataProvider.getCategoriesByDepartmentIds(this.selectedDepartmentIds).subscribe({
      next: (response: TaskCategoryDTO[]) => {
        this.categoryList = response;

        this.categoriesLoading = false;

        const validIds = response.map((category) => category.taskcategoryId);

        this.selectedCategoryIds = this.selectedCategoryIds.filter((id) => validIds.includes(id));

        this.showCategoryValidation = this.selectedCategoryIds.length === 0;

        console.log('EDIT - Available Categories:', validIds);
        console.log('EDIT - Selected Categories:', this.selectedCategoryIds);
      },

      error: (error) => {
        console.error('Error loading categories for edit:', error);

        this.categoryList = [];
        this.categoriesLoading = false;
      },
    });
  }

  private loadPermissionModules(rightsAndPermissionId: number): void {
    this.dataProvider.getUserManagementDetailsById(rightsAndPermissionId).subscribe({
      next: (response: any) => {
        if (response?.module) {
          this.buildPermissionGroups(response.module);
        }
      },
      error: (err) => {
        console.error('Failed to load permissions', err);
      },
    });
  }

  private buildPermissionGroups(modules: any[]): void {
    const sortedModules = [...modules].sort((a, b) => a.type - b.type);

    const grouped: { [key: number]: any[] } = {};

    sortedModules.forEach((module) => {
      if (!grouped[module.type]) {
        grouped[module.type] = [];
      }
      grouped[module.type].push(module);
    });

    this.groupedModules = Object.keys(grouped).map((type) => ({
      type: Number(type),
      modules: grouped[Number(type)],
    }));

    this.permissions = {};
    this.selectAllRows = {};

    this.groupedModules.forEach((group) => {
      const groupName = this.typeGroupMap[group.type];

      this.selectAllRows[groupName] = {};

      this.permissionActions.forEach((action) => {
        this.selectAllRows[groupName][action] = false;
      });

      group.modules.forEach((module) => {
        const moduleName = module.name.trim();

        this.permissions[moduleName] = {};

        this.permissionActions.forEach((action) => {
          const apiField = this.permissionApiMap[action];
          this.permissions[moduleName][action] = module[apiField] === 'Y';
        });
      });
    });

    this.initializeSelectAllRows();

    this.originalPermissions = JSON.parse(JSON.stringify(this.permissions));
    this.originalSelectAllRows = JSON.parse(JSON.stringify(this.selectAllRows));
  }

  private initializeSelectAllRows(): void {
    this.groupedModules.forEach((group) => {
      const groupName = this.typeGroupMap[group.type];

      this.permissionActions.forEach((action) => {
        const allChecked = group.modules.length > 0 && group.modules.every((module) => this.permissions[module.name.trim()]?.[action] === true);

        this.selectAllRows[groupName][action] = allChecked;
      });
    });
  }

  toggleGroupSelectAll(groupName: string, action: string): void {
    const group = this.groupedModules.find((g) => this.typeGroupMap[g.type] === groupName);

    if (!group) {
      return;
    }

    const newValue = this.selectAllRows[groupName][action];

    const dependentActions = ['Add', 'Edit', 'Delete', 'Approve', 'Admin Approval', 'Export Excel'];

    group.modules.forEach((module) => {
      const moduleName = module.name.trim();

      if (!this.permissions[moduleName]) {
        return;
      }

      this.permissions[moduleName][action] = newValue;

      if (dependentActions.includes(action) && newValue) {
        this.permissions[moduleName]['View Only'] = true;
      }

      if (dependentActions.includes(action) && !newValue) {
        const hasOtherPermission = dependentActions.some((a) => this.permissions[moduleName][a]);

        if (!hasOtherPermission) {
          this.permissions[moduleName]['View Only'] = false;
        }
      }
    });

    this.initializeSelectAllRows();
  }

  onPermissionChange(moduleName: string, action: string): void {
    const dependentActions = ['Add', 'Edit', 'Delete', 'Approve', 'Admin Approval', 'Export Excel'];

    if (action === 'View Only') {
      if (this.permissions[moduleName]['View Only']) {
        dependentActions.forEach((permission) => {
          this.permissions[moduleName][permission] = false;
        });
      }
    }

    if (dependentActions.includes(action)) {
      if (this.permissions[moduleName][action]) {
        this.permissions[moduleName]['View Only'] = true;
      }
    }

    this.initializeSelectAllRows();
  }

  private clearAllPermissions(): void {
    Object.keys(this.permissions).forEach((moduleName) => {
      this.permissionActions.forEach((action) => {
        this.permissions[moduleName][action] = false;
      });
    });

    Object.keys(this.selectAllRows).forEach((groupName) => {
      this.permissionActions.forEach((action) => {
        this.selectAllRows[groupName][action] = false;
      });
    });
  }

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }

    this.userForm.markAllAsTouched();

    this.showDepartmentValidation = true;
    this.showCategoryValidation = true;

    if (this.selectedDepartmentIds.length === 0) {
      console.error('DEPARTMENT IS REQUIRED');
      return;
    }

    if (!this.selectedCategoryIds || this.selectedCategoryIds.length === 0) {
      console.error('CATEGORY IS REQUIRED');
      return;
    }

    if (this.userForm.invalid) {
      console.error('FORM IS INVALID - API WILL NOT BE CALLED');
      return;
    }

    if (!this.validateExpiryDate()) {
      return;
    }

    this.isSubmitting = true;

    const formValues = this.userForm.value;
    const formattedExpiryDate = this.formatDateForApi(formValues.expiryDate);

    const payload: any = {
      userId: this.isEditMode ? this.userId : 0,
      firstName: formValues.name ? formValues.name.trim() : '',
      mobileNo: formValues.mobile || '',
      email: formValues.email ? formValues.email.trim().toLowerCase() : '',
      expiryDate: formattedExpiryDate,
      permission: formValues.isAdmin ? 'Y' : 'N',
      isHod: formValues.isHod ? 'Y' : 'N',
      departmentIds: this.selectedDepartmentIds,
      categoryIds: this.selectedCategoryIds,
      status: Number(formValues.status),
      designationId: Number(formValues.desigmationId),
      qcFlag: 0,
      telephone: formValues.telephone || '',
      createdBy: this.createdBy,
      weeklyOff: formValues.weeklyOff ? Number(formValues.weeklyOff) : null,
      module: this.isRightsHidden ? [] : this.buildModulePermissions(),
    };

    if (formValues.password && formValues.password.trim()) {
      payload.password = formValues.password.trim();
    }

    console.log('FINAL USER PAYLOAD:', JSON.stringify(payload, null, 2));

    this.dataProvider.saveUserManagementDetailsDetail(payload).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;

        if (response?.success === false) {
          alert(response.message || 'Operation failed.');
          return;
        }

        alert(this.isEditMode ? 'User updated successfully!' : 'User saved successfully!');

        this.backToIndexPage();
      },

      error: (err) => {
        this.isSubmitting = false;

        console.error('Save user error:', err);

        alert(err?.error?.message || (this.isEditMode ? 'Failed to update user.' : 'Failed to save user.'));
      },
    });
  }

  private buildModulePermissions(): any[] {
    return this.groupedModules.flatMap((group) =>
      group.modules.map((module) => {
        const moduleName = module.name.trim();
        const permission = this.permissions[moduleName] || {};

        return {
          moduleId: module.moduleId?.toString(),
          addPer: permission['Add'] ? 'Y' : 'N',
          editPer: permission['Edit'] ? 'Y' : 'N',
          deletePer: permission['Delete'] ? 'Y' : 'N',
          approvePer: permission['Approve'] ? 'Y' : 'N',
          adminApprovePer: permission['Admin Approval'] ? 'Y' : 'N',
          viewPer: permission['View Only'] ? 'Y' : 'N',
          exportExcel: permission['Export Excel'] ? 'Y' : 'N',
        };
      }),
    );
  }

  onReset(): void {
    if (this.isEditMode) {
      this.loadUserDetails();
      return;
    }

    this.userForm.reset({
      name: '',
      email: '',
      expiryDate: new Date(2050, 11, 31),
      password: '',
      mobile: '',
      telephone: '',
      status: 1,
      isAdmin: false,
      isHod: false,
      weeklyOff: null,
      desigmationId: null,
    });

    this.selectedDepartmentIds = [];
    this.selectedCategoryIds = [];
    this.categoryList = [];
    this.showDepartmentDropdown = false;
    this.showCategoryDropdown = false;
    this.showDepartmentValidation = false;
    this.showCategoryValidation = false;

    this.permissions = JSON.parse(JSON.stringify(this.originalPermissions));
    this.selectAllRows = JSON.parse(JSON.stringify(this.originalSelectAllRows));
  }

  backToIndexPage(): void {
    this.router.navigate(['/user-management-index'], {
      state: {
        currentPage: this.currentPage,
        statusIndex: this.statusIndex,
        searchText: this.searchText,
        size: this.size,
      },
    });
  }

  private readFilterState(): void {
    let stateData: any = null;

    const navigation = this.router.getCurrentNavigation();

    stateData = navigation?.extras?.state;

    if (!stateData && isPlatformBrowser(this.platformId)) {
      const saved = sessionStorage.getItem('userFilters');

      if (saved) {
        try {
          stateData = JSON.parse(saved);
        } catch {
          stateData = null;
        }
      }
    }

    if (stateData) {
      this.currentPage = stateData.currentPage ?? 1;
      this.statusIndex = stateData.statusIndex ?? 0;
      this.searchText = stateData.searchText ?? '';
      this.size = stateData.size ?? 10;
    }
  }

  validateExpiryDate(): boolean {
    const control = this.userForm.get('expiryDate');
    const value = control?.value;

    if (!value) {
      console.error('Expiry Date is empty');
      return false;
    }

    if (!(value instanceof Date)) {
      console.error('Expiry Date is not a Date object:', value);
      return false;
    }

    if (isNaN(value.getTime())) {
      console.error('Expiry Date is invalid:', value);
      return false;
    }

    const selectedDate = new Date(value);
    selectedDate.setHours(0, 0, 0, 0);

    const minimumDate = new Date(this.minDate);
    minimumDate.setHours(0, 0, 0, 0);

    if (selectedDate < minimumDate) {
      control?.setErrors({
        ...(control.errors || {}),
        matDatepickerMin: true,
      });

      alert('Expiry Date cannot be a past date.');
      return false;
    }

    return true;
  }

  private formatDateForApi(date: Date | null): string {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      console.error('Invalid expiry date:', date);
      return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private parseExpiryDate(value: any): Date | null {
    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      const date = new Date(value);
      date.setHours(0, 0, 0, 0);
      return date;
    }

    const dateString = String(value).trim();

    const yyyyMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (yyyyMatch) {
      const date = new Date(Number(yyyyMatch[1]), Number(yyyyMatch[2]) - 1, Number(yyyyMatch[3]));
      date.setHours(0, 0, 0, 0);
      return date;
    }

    const ddMatch = dateString.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (ddMatch) {
      const date = new Date(Number(ddMatch[3]), Number(ddMatch[2]) - 1, Number(ddMatch[1]));
      date.setHours(0, 0, 0, 0);
      return date;
    }

    const slashMatch = dateString.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
    if (slashMatch) {
      const date = new Date(Number(slashMatch[1]), Number(slashMatch[2]) - 1, Number(slashMatch[3]));
      date.setHours(0, 0, 0, 0);
      return date;
    }

    const normalized = dateString.replace(' IST ', ' GMT+0530 ');
    const parsed = new Date(normalized);

    if (!isNaN(parsed.getTime())) {
      parsed.setHours(0, 0, 0, 0);
      return parsed;
    }

    console.error('Unable to parse expiry date:', value);
    return null;
  }

  allowOnlyLetters(event: KeyboardEvent): void {
    if (!/^[a-zA-Z\s]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.which || event.keyCode;

    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  allowOnlyDateChars(event: KeyboardEvent): void {
    const char = event.key;

    if (!/[0-9\-\/]/.test(char) && char !== 'Backspace' && char !== 'Delete' && char !== 'Tab' && !event.ctrlKey && !event.metaKey && !['ArrowLeft', 'ArrowRight'].includes(char)) {
      event.preventDefault();
    }
  }

  getStatusLabel(status: number): string {
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

  loadDepartments(): void {
    this.dataProvider.getActiveDepartments().subscribe({
      next: (response: DepartmentDTO[]) => {
        this.departmentList = response;
      },
      error: (error) => {
        console.error('Error loading departments', error);
      },
    });
  }

  loadDesignations(): void {
    this.dataProvider.getActiveDesigmations().subscribe({
      next: (response: DesignationDTO[]) => {
        this.designationList = response;
      },
      error: (error) => {
        console.error('Error loading designations', error);
      },
    });
  }

  toggleDepartment(departmentId: number, event: Event): void {
    const checkbox = event.target as HTMLInputElement;

    if (checkbox.checked) {
      if (!this.selectedDepartmentIds.includes(departmentId)) {
        this.selectedDepartmentIds.push(departmentId);
      }
    } else {
      this.selectedDepartmentIds = this.selectedDepartmentIds.filter((id) => id !== departmentId);
    }

    this.showDepartmentValidation = this.selectedDepartmentIds.length === 0;

    this.loadCategories();
  }

  onSingleDepartmentChange(departmentId: number | null): void {
    this.selectedDepartmentIds = departmentId ? [Number(departmentId)] : [];
    this.showDepartmentValidation = this.selectedDepartmentIds.length === 0;

    this.loadCategories();
  }

  get isHod(): boolean {
    return !!this.userForm.get('isHod')?.value;
  }

  isDepartmentChecked(departmentId: number): boolean {
    return this.selectedDepartmentIds.includes(departmentId);
  }

  getSelectedDepartmentNames(): string {
    if (!this.departmentList || !this.selectedDepartmentIds?.length) {
      return '';
    }

    return this.departmentList
      .filter((dept) => this.selectedDepartmentIds.includes(dept.departmentId))
      .map((dept) => dept.name)
      .join(', ');
  }

  // loadCategories(clearSelection: boolean = true): void {
  //   if (this.selectedDepartmentIds.length === 0) {
  //     this.categoryList = [];
  //     this.selectedCategoryIds = [];
  //     this.categoriesLoading = false;
  //     return;
  //   }

  //   this.categoriesLoading = true;

  //   this.dataProvider.getCategoriesByDepartmentIds(this.selectedDepartmentIds).subscribe({
  //     next: (response: TaskCategoryDTO[]) => {
  //       this.categoryList = response;
  //       this.categoriesLoading = false;

  //       // if (clearSelection) {
  //       //   if (this.selectedDepartmentIds.includes(1)) {
  //       //     this.selectedCategoryIds = response.map((category) => category.taskcategoryId);
  //       //     this.showCategoryValidation = false;
  //       //   } else {
  //       //     const validIds = response.map((category) => category.taskcategoryId);
  //       //     this.selectedCategoryIds = this.selectedCategoryIds.filter((id) => validIds.includes(id));
  //       //   }
  //       // }

  //       if (clearSelection) {
  //         if (this.isHod) {
  //           this.selectedCategoryIds = response.map((category) => category.taskcategoryId);

  //           this.showCategoryValidation = false;
  //         } else if (this.selectedDepartmentIds.includes(1)) {
  //           this.selectedCategoryIds = response.map((category) => category.taskcategoryId);

  //           this.showCategoryValidation = false;
  //         } else {
  //           const validIds = response.map((category) => category.taskcategoryId);

  //           this.selectedCategoryIds = this.selectedCategoryIds.filter((id) => validIds.includes(id));
  //         }
  //       }
  //     },

  //     error: (error) => {
  //       console.error('Error loading categories:', error);
  //       this.categoryList = [];
  //       this.categoriesLoading = false;
  //     },
  //   });
  // }

  loadCategories(clearSelection: boolean = true): void {
    if (this.selectedDepartmentIds.length === 0) {
      this.categoryList = [];
      this.selectedCategoryIds = [];
      this.categoriesLoading = false;
      return;
    }

    this.categoriesLoading = true;

    this.dataProvider.getCategoriesByDepartmentIds(this.selectedDepartmentIds).subscribe({
      next: (response: TaskCategoryDTO[]) => {
        this.categoryList = response;
        this.categoriesLoading = false;

        if (this.isHod) {
          const validIds = response.map((category) => category.taskcategoryId);

          this.selectedCategoryIds = this.selectedCategoryIds.filter((id) => validIds.includes(id));

          this.showCategoryValidation = this.selectedCategoryIds.length === 0;

          return;
        }

        if (clearSelection) {
          if (this.selectedDepartmentIds.includes(1)) {
            this.selectedCategoryIds = response.map((category) => category.taskcategoryId);

            this.showCategoryValidation = false;
          } else {
            const validIds = response.map((category) => category.taskcategoryId);

            this.selectedCategoryIds = this.selectedCategoryIds.filter((id) => validIds.includes(id));

            this.showCategoryValidation = this.selectedCategoryIds.length === 0;
          }
        }
      },

      error: (error) => {
        console.error('Error loading categories:', error);

        this.categoryList = [];
        this.categoriesLoading = false;
      },
    });
  }

  toggleCategory(categoryId: number, event: Event): void {
    const checkbox = event.target as HTMLInputElement;

    if (checkbox.checked) {
      if (!this.selectedCategoryIds.includes(categoryId)) {
        this.selectedCategoryIds.push(categoryId);
      }
    } else {
      this.selectedCategoryIds = this.selectedCategoryIds.filter((id) => id !== categoryId);
    }

    this.showCategoryValidation = this.selectedCategoryIds.length === 0;
  }

  isCategoryChecked(taskcategoryId: number): boolean {
    return this.selectedCategoryIds.includes(taskcategoryId);
  }

  getSelectedCategoryNames(): string {
    if (!this.categoryList || !this.selectedCategoryIds?.length) {
      return '';
    }

    return this.categoryList
      .filter((category) => this.selectedCategoryIds.includes(category.taskcategoryId))
      .map((category) => category.name)
      .join(', ');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;

    if (this.showDepartmentDropdown && this.departmentDropdown && !this.departmentDropdown.nativeElement.contains(target)) {
      this.showDepartmentDropdown = false;
    }

    if (this.showCategoryDropdown && this.categoryDropdown && !this.categoryDropdown.nativeElement.contains(target)) {
      this.showCategoryDropdown = false;
    }
  }

  get isRightsHidden(): boolean {
    return this.selectedDepartmentIds.includes(1);
  }

  get singleDepartmentId(): number | null {
    return this.selectedDepartmentIds.length ? this.selectedDepartmentIds[0] : null;
  }

  areAllCategoriesSelected(): boolean {
    if (!this.categoryList || this.categoryList.length === 0) {
      return false;
    }

    return this.categoryList.every((category) => this.selectedCategoryIds.includes(category.taskcategoryId));
  }

  isSomeCategoriesSelected(): boolean {
    if (!this.categoryList || this.categoryList.length === 0) {
      return false;
    }

    const selectedCount = this.categoryList.filter((category) => this.selectedCategoryIds.includes(category.taskcategoryId)).length;

    return selectedCount > 0 && selectedCount < this.categoryList.length;
  }

  toggleAllCategories(event: Event): void {
    const checkbox = event.target as HTMLInputElement;

    if (checkbox.checked) {
      this.selectedCategoryIds = this.categoryList.map((category) => category.taskcategoryId);

      this.showCategoryValidation = false;
    } else {
      this.selectedCategoryIds = [];

      this.showCategoryValidation = true;
    }
  }
}
