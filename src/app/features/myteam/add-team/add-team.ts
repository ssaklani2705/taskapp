import {
  AfterViewInit,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { DateAdapter } from '@angular/material/core';
import { DataProviderService } from '../../../service/data-provider.service';
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

  /**
   * Permission actions
   */
  permissionActions: string[] = [
    'Add',
    'Edit',
    'Delete',
    'Approve',
    'Admin Approval',
    'View Only',
    'Export Excel',
  ];

  /**
   * API permission names
   */
  permissionApiMap: any = {
    Add: 'addPer',
    Edit: 'editPer',
    Delete: 'deletePer',
    Approve: 'approvePer',
    'Admin Approval': 'adminApprovePer',
    'View Only': 'viewPer',
    'Export Excel': 'exportExcel',
  };

  /**
   * Group names
   */
  typeGroupMap: {
    [key: number]: string;
  } = {
    1: 'Masters',
    2: 'Activity',
    3: 'Reports - 1',
  };

  groupedModules: {
    type: number;
    modules: any[];
  }[] = [];

  permissions: any = {};

  selectAllRows: any = {};

  originalPermissions: any = {};

  originalSelectAllRows: any = {};

  constructor(
    private fb: FormBuilder,
    private dataProvider: DataProviderService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID)
    private platformId: Object,
  ) {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    this.minDate = today;

    this.createForm();
  }

  // ============================================================
  // FORM
  // ============================================================

  private createForm(): void {
    this.userForm = this.fb.group({
      name: ['', Validators.required],

      email: ['', [Validators.required, Validators.email]],

      expiryDate: ['', Validators.required],

      password: [''],

      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],

      telephone: [''],

      status: [1, Validators.required],

      isAdmin: [false],
    });

    this.userForm.get('isAdmin')?.valueChanges.subscribe((isAdmin: boolean) => {
      if (isAdmin) {
        this.clearAllPermissions();
      }
    });
  }

  // ============================================================
  // INIT
  // ============================================================

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.createdBy = sessionStorage.getItem('userId');
    }

    this.readFilterState();

    const id = this.route.snapshot.paramMap.get('userId');

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

  // ============================================================
  // AFTER VIEW INIT
  // ============================================================

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

  // ============================================================
  // ADD MODE
  // ============================================================

  private setupAddMode(): void {
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);

    this.userForm.get('password')?.updateValueAndValidity();

    this.userForm.patchValue({
      status: 1,
      isAdmin: false,
    });

    /**
     * Default expiry date
     */
    const defaultDate = new Date('2050-12-31');

    this.userForm.get('expiryDate')?.setValue(this.formatDate(defaultDate));

    /**
     * Load permission master data
     */
    this.loadPermissionModules(0);
  }

  // ============================================================
  // EDIT MODE
  // ============================================================

  private loadUserDetails(): void {
    this.dataProvider.getUserManagementDetailsById(this.userId).subscribe({
      next: (response: any) => {
        if (!response) {
          alert('User details not found.');
          this.backToIndexPage();
          return;
        }

        /**
         * Password is optional while editing
         */
        this.userForm.get('password')?.clearValidators();

        this.userForm.get('password')?.updateValueAndValidity();

        this.userForm.patchValue({
          name: response.firstName || '',

          email: response.email || '',

          mobile: response.mobileNo || '',

          telephone: response.telephone && response.telephone !== 'NA' ? response.telephone : '',

          expiryDate: this.formatDateToDDMMYYYY(response.expiryDate),

          status: Number(response.status) || 1,

          isAdmin: response.permission === 'Y',
        });

        /**
         * Load permissions returned by API
         */
        if (response.module) {
          this.buildPermissionGroups(response.module);
        }
      },

      error: (err) => {
        console.error('Failed to fetch user details', err);

        alert('Failed to load user details.');

        this.backToIndexPage();
      },
    });
  }

  // ============================================================
  // LOAD PERMISSION MODULES
  // ============================================================

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

  // ============================================================
  // BUILD GROUPS
  // ============================================================

  private buildPermissionGroups(modules: any[]): void {
    const sortedModules = [...modules].sort((a, b) => a.type - b.type);

    const grouped: {
      [key: number]: any[];
    } = {};

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

          /**
           * Edit:
           * Read existing Y/N
           *
           * Add:
           * Default false
           */
          this.permissions[moduleName][action] = module[apiField] === 'Y';
        });
      });
    });

    this.initializeSelectAllRows();

    this.originalPermissions = JSON.parse(JSON.stringify(this.permissions));

    this.originalSelectAllRows = JSON.parse(JSON.stringify(this.selectAllRows));
  }

  // ============================================================
  // SELECT ALL INITIALIZATION
  // ============================================================

  private initializeSelectAllRows(): void {
    this.groupedModules.forEach((group) => {
      const groupName = this.typeGroupMap[group.type];

      this.permissionActions.forEach((action) => {
        const allChecked =
          group.modules.length > 0 &&
          group.modules.every((module) => this.permissions[module.name.trim()]?.[action] === true);

        this.selectAllRows[groupName][action] = allChecked;
      });
    });
  }

  // ============================================================
  // GROUP SELECT ALL
  // ============================================================

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

      /**
       * Any real permission automatically
       * enables View Only.
       */
      if (dependentActions.includes(action) && newValue) {
        this.permissions[moduleName]['View Only'] = true;
      }

      /**
       * Remove View Only if no other
       * permission remains.
       */
      if (dependentActions.includes(action) && !newValue) {
        const hasOtherPermission = dependentActions.some((a) => this.permissions[moduleName][a]);

        if (!hasOtherPermission) {
          this.permissions[moduleName]['View Only'] = false;
        }
      }
    });

    this.initializeSelectAllRows();
  }

  // ============================================================
  // SINGLE PERMISSION
  // ============================================================

  onPermissionChange(moduleName: string, action: string): void {
    const dependentActions = ['Add', 'Edit', 'Delete', 'Approve', 'Admin Approval', 'Export Excel'];

    /**
     * View Only checked:
     * remove other permissions.
     */
    if (action === 'View Only') {
      if (this.permissions[moduleName]['View Only']) {
        dependentActions.forEach((permission) => {
          this.permissions[moduleName][permission] = false;
        });
      }
    }

    /**
     * Any actual permission:
     * View Only automatically checked.
     */
    if (dependentActions.includes(action)) {
      if (this.permissions[moduleName][action]) {
        this.permissions[moduleName]['View Only'] = true;
      }
    }

    this.initializeSelectAllRows();
  }

  // ============================================================
  // CLEAR PERMISSIONS
  // ============================================================

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

  // ============================================================
  // SUBMIT
  // ============================================================

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }

    this.userForm.markAllAsTouched();

    if (this.userForm.invalid) {
      return;
    }

    if (!this.validateExpiryDate()) {
      return;
    }

    this.isSubmitting = true;

    const formValues = this.userForm.value;

    let formattedExpiryDate = formValues.expiryDate;

    if (formattedExpiryDate) {
      const parts = formattedExpiryDate.split('-');

      if (parts.length === 3) {
        formattedExpiryDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    const payload: any = {
      userId: this.isEditMode ? this.userId : 0,

      firstName: formValues.name.trim(),

      mobileNo: formValues.mobile,

      email: formValues.email.trim().toLowerCase(),

      expiryDate: formattedExpiryDate,

      permission: formValues.isAdmin ? 'Y' : 'N',

      status: Number(formValues.status),

      qcFlag: 0,

      telephone: formValues.telephone || '',

      createdBy: this.createdBy,

      module: this.buildModulePermissions(),
    };

    /**
     * Password:
     *
     * Add -> send password
     * Edit -> send only if user entered one
     */
    if (formValues.password && formValues.password.trim()) {
      payload.password = formValues.password;
    }

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

        alert(
          err?.error?.message ||
            (this.isEditMode ? 'Failed to update user.' : 'Failed to save user.'),
        );
      },
    });
  }

  // ============================================================
  // BUILD API PERMISSIONS
  // ============================================================

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

  // ============================================================
  // RESET
  // ============================================================

  onReset(): void {
    if (this.isEditMode) {
      this.loadUserDetails();

      return;
    }

    this.userForm.reset({
      name: '',

      email: '',

      expiryDate: this.formatDate(new Date('2050-12-31')),

      password: '',

      mobile: '',

      telephone: '',

      status: 1,

      isAdmin: false,
    });

    this.permissions = JSON.parse(JSON.stringify(this.originalPermissions));

    this.selectAllRows = JSON.parse(JSON.stringify(this.originalSelectAllRows));
  }

  // ============================================================
  // BACK
  // ============================================================

  backToIndexPage(): void {
    this.router.navigate(['/my-team'], {
      state: {
        currentPage: this.currentPage,
        statusIndex: this.statusIndex,
        searchText: this.searchText,
        size: this.size,
      },
    });
  }

  // ============================================================
  // FILTER STATE
  // ============================================================

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

  // ============================================================
  // VALIDATION
  // ============================================================

  validateExpiryDate(): boolean {
    const value = this.userForm.get('expiryDate')?.value;

    if (!value) {
      alert('Please select a valid Expiry Date.');

      return false;
    }

    const parts = value.split('-').map(Number);

    if (parts.length !== 3) {
      alert('Please select a valid Expiry Date.');

      return false;
    }

    const [day, month, year] = parts;

    const enteredDate = new Date(year, month - 1, day);

    enteredDate.setHours(0, 0, 0, 0);

    const min = new Date(this.minDate);

    min.setHours(0, 0, 0, 0);

    if (enteredDate < min) {
      alert('Expiry Date cannot be a past date.');

      return false;
    }

    return true;
  }

  // ============================================================
  // DATE
  // ============================================================

  private formatDate(date: Date): string {
    const day = ('0' + date.getDate()).slice(-2);

    const month = ('0' + (date.getMonth() + 1)).slice(-2);

    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  private formatDateToDDMMYYYY(dateStr: string): string {
    if (!dateStr) {
      return '';
    }

    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
      return '';
    }

    return this.formatDate(date);
  }

  // ============================================================
  // INPUT RESTRICTIONS
  // ============================================================

  allowOnlyLetters(event: KeyboardEvent): void {
    const char = event.key;

    if (!/^[a-zA-Z\s]$/.test(char)) {
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

    if (
      !/[0-9\-\/]/.test(char) &&
      char !== 'Backspace' &&
      char !== 'Delete' &&
      char !== 'Tab' &&
      !event.ctrlKey &&
      !event.metaKey &&
      !['ArrowLeft', 'ArrowRight'].includes(char)
    ) {
      event.preventDefault();
    }
  }

  // ============================================================
  // STATUS
  // ============================================================

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
}
