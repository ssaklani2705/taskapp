import {
  AfterViewInit,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
<<<<<<< HEAD
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
=======
  ViewEncapsulation
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
<<<<<<< HEAD
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
=======
  Validators
} from '@angular/forms';

import {
  MatCheckboxModule
} from '@angular/material/checkbox';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatSelectModule
} from '@angular/material/select';

import {
  MatInputModule
} from '@angular/material/input';

import {
  MatFormFieldModule
} from '@angular/material/form-field';

import {
  MatDatepickerModule
} from '@angular/material/datepicker';

import {
  MAT_DATE_LOCALE,
  MatNativeDateModule
} from '@angular/material/core';

import {
  DateAdapter
} from '@angular/material/core';

import {
  DataProviderService,
  DepartmentDTO,
  DesignationDTO
} from '../../../service/data-provider.service';
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
import { MyDateAdapter } from '../../../classes/my-date-adapter';

declare var $: any;
@Component({
  selector: 'app-add-team',
  standalone: true,
<<<<<<< HEAD
=======

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
<<<<<<< HEAD
=======

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
<<<<<<< HEAD
    MatDatepickerModule,
    MatNativeDateModule,
=======

    MatDatepickerModule,
    MatNativeDateModule
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  ],
  templateUrl: './add-team.html',
  styleUrl: './add-team.scss',
  encapsulation: ViewEncapsulation.Emulated,
<<<<<<< HEAD
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

=======

  providers: [
    {
      provide: DateAdapter,
      useClass: MyDateAdapter
    },
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'en-GB'
    }
  ]
})
export class AddTeam implements OnInit, AfterViewInit {

  userForm!: FormGroup;

  /**
   * true  = edit
   * false = add
   */
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
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
<<<<<<< HEAD
    'Export Excel',
=======
    'Export Excel'
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  ];

  /**
   * API permission names
   */
  permissionApiMap: any = {
<<<<<<< HEAD
    Add: 'addPer',
    Edit: 'editPer',
    Delete: 'deletePer',
    Approve: 'approvePer',
    'Admin Approval': 'adminApprovePer',
    'View Only': 'viewPer',
    'Export Excel': 'exportExcel',
=======
    'Add': 'addPer',
    'Edit': 'editPer',
    'Delete': 'deletePer',
    'Approve': 'approvePer',
    'Admin Approval': 'adminApprovePer',
    'View Only': 'viewPer',
    'Export Excel': 'exportExcel'
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  };

  /**
   * Group names
   */
  typeGroupMap: {
<<<<<<< HEAD
    [key: number]: string;
  } = {
    1: 'Masters',
    2: 'Activity',
    3: 'Reports - 1',
  };
=======
    [key: number]: string
  } = {
      1: 'Masters',
      2: 'Activity',
      3: 'Reports - 1'
    };
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a

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
<<<<<<< HEAD
    private platformId: Object,
  ) {
=======
    private platformId: Object
  ) {

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    this.minDate = today;

    this.createForm();
  }

  // ============================================================
  // FORM
  // ============================================================

  private createForm(): void {
<<<<<<< HEAD
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
=======

    this.userForm = this.fb.group({

      name: [
        '',
        Validators.required
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      expiryDate: [
        '',
        Validators.required
      ],

      password: [
        ''
      ],

      mobile: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{10}$/)
        ]
      ],

      telephone: [
        ''
      ],

      status: [
        1,
        Validators.required
      ],

      isAdmin: [
        false
      ],
      departmentId: [null, Validators.required],
      desigmationId: [null, Validators.required],

    });

    this.userForm
      .get('isAdmin')
      ?.valueChanges
      .subscribe((isAdmin: boolean) => {

        if (isAdmin) {
          this.clearAllPermissions();
        }
      });
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  }

  // ============================================================
  // INIT
  // ============================================================

  ngOnInit(): void {
<<<<<<< HEAD
=======

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
    if (isPlatformBrowser(this.platformId)) {
      this.createdBy = sessionStorage.getItem('userId');
    }

    this.readFilterState();

    const id = this.route.snapshot.paramMap.get('userId');

    if (id) {
<<<<<<< HEAD
=======

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
      this.isEditMode = true;

      this.userId = Number(id);

      this.loadUserDetails();
<<<<<<< HEAD
    } else {
=======

    } else {

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
      this.isEditMode = false;

      this.userId = 0;

      this.setupAddMode();
    }
<<<<<<< HEAD
=======

    this.loadDepartments();
    this.loadDesignations();
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  }

  // ============================================================
  // AFTER VIEW INIT
  // ============================================================

  ngAfterViewInit(): void {
<<<<<<< HEAD
    setTimeout(() => {
      if ($('#fromDatePicker').length) {
=======

    setTimeout(() => {

      if ($('#fromDatePicker').length) {

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
        $('#fromDatePicker')
          .datepicker({
            format: 'dd-mm-yyyy',
            autoclose: true,
<<<<<<< HEAD
            startDate: this.minDate,
          })
          .on('changeDate', (e: any) => {
            this.userForm.get('expiryDate')?.setValue(e.format('dd-mm-yyyy'));

            this.userForm.get('expiryDate')?.markAsDirty();
          });
      }
=======
            startDate: this.minDate
          })
          .on('changeDate', (e: any) => {

            this.userForm
              .get('expiryDate')
              ?.setValue(
                e.format('dd-mm-yyyy')
              );

            this.userForm
              .get('expiryDate')
              ?.markAsDirty();
          });
      }

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
    }, 100);
  }

  // ============================================================
  // ADD MODE
  // ============================================================

  private setupAddMode(): void {
<<<<<<< HEAD
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);

    this.userForm.get('password')?.updateValueAndValidity();

    this.userForm.patchValue({
      status: 1,
      isAdmin: false,
=======

    this.userForm
      .get('password')
      ?.setValidators([
        Validators.required,
        Validators.minLength(6)
      ]);

    this.userForm
      .get('password')
      ?.updateValueAndValidity();

    this.userForm.patchValue({
      status: 1,
      isAdmin: false
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
    });

    /**
     * Default expiry date
     */
    const defaultDate = new Date('2050-12-31');

<<<<<<< HEAD
    this.userForm.get('expiryDate')?.setValue(this.formatDate(defaultDate));
=======
    this.userForm
      .get('expiryDate')
      ?.setValue(
        this.formatDate(defaultDate)
      );
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a

    /**
     * Load permission master data
     */
    this.loadPermissionModules(0);
  }

  // ============================================================
  // EDIT MODE
  // ============================================================

  private loadUserDetails(): void {
<<<<<<< HEAD
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
=======

    this.dataProvider
      .getUserManagementDetailsById(this.userId)
      .subscribe({

        next: (response: any) => {

          if (!response) {
            alert('User details not found.');
            this.backToIndexPage();
            return;
          }

          /**
           * Password is optional while editing
           */
          this.userForm
            .get('password')
            ?.clearValidators();

          this.userForm
            .get('password')
            ?.updateValueAndValidity();

          this.userForm.patchValue({

            name: response.firstName || '',

            email: response.email || '',

            mobile: response.mobileNo || '',

            telephone:
              response.telephone &&
                response.telephone !== 'NA'
                ? response.telephone
                : '',

            expiryDate:
              this.formatDateToDDMMYYYY(
                response.expiryDate
              ),

            status:
              Number(response.status) || 1,

            isAdmin:
              response.permission === 'Y',
            departmentId: response.departmentId || null,
desigmationId: response.desigmationId || null
          });

          /**
           * Load permissions returned by API
           */
          if (response.module) {
            this.buildPermissionGroups(
              response.module
            );
          }

        },

        error: (err) => {

          console.error(
            'Failed to fetch user details',
            err
          );

          alert(
            'Failed to load user details.'
          );

          this.backToIndexPage();
        }
      });
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  }

  // ============================================================
  // LOAD PERMISSION MODULES
  // ============================================================

<<<<<<< HEAD
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
=======
  private loadPermissionModules(
    rightsAndPermissionId: number
  ): void {

    this.dataProvider
      .getUserManagementDetailsById(
        rightsAndPermissionId
      )
      .subscribe({

        next: (response: any) => {

          if (response?.module) {

            this.buildPermissionGroups(
              response.module
            );
          }
        },

        error: (err) => {

          console.error(
            'Failed to load permissions',
            err
          );
        }
      });
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  }

  // ============================================================
  // BUILD GROUPS
  // ============================================================

<<<<<<< HEAD
  private buildPermissionGroups(modules: any[]): void {
    const sortedModules = [...modules].sort((a, b) => a.type - b.type);

    const grouped: {
      [key: number]: any[];
    } = {};

    sortedModules.forEach((module) => {
=======
  private buildPermissionGroups(
    modules: any[]
  ): void {

    const sortedModules = [...modules]
      .sort(
        (a, b) => a.type - b.type
      );

    const grouped: {
      [key: number]: any[]
    } = {};

    sortedModules.forEach(module => {

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
      if (!grouped[module.type]) {
        grouped[module.type] = [];
      }

      grouped[module.type].push(module);
    });

<<<<<<< HEAD
    this.groupedModules = Object.keys(grouped).map((type) => ({
      type: Number(type),
      modules: grouped[Number(type)],
    }));
=======
    this.groupedModules =
      Object.keys(grouped)
        .map(type => ({
          type: Number(type),
          modules: grouped[Number(type)]
        }));
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a

    this.permissions = {};

    this.selectAllRows = {};

<<<<<<< HEAD
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
=======
    this.groupedModules.forEach(group => {

      const groupName =
        this.typeGroupMap[group.type];

      this.selectAllRows[groupName] = {};

      this.permissionActions.forEach(action => {

        this.selectAllRows[groupName][action] =
          false;
      });

      group.modules.forEach(module => {

        const moduleName =
          module.name.trim();

        this.permissions[moduleName] = {};

        this.permissionActions.forEach(
          action => {

            const apiField =
              this.permissionApiMap[action];

            /**
             * Edit:
             * Read existing Y/N
             *
             * Add:
             * Default false
             */
            this.permissions[moduleName][action] =
              module[apiField] === 'Y';
          }
        );
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
      });
    });

    this.initializeSelectAllRows();

<<<<<<< HEAD
    this.originalPermissions = JSON.parse(JSON.stringify(this.permissions));

    this.originalSelectAllRows = JSON.parse(JSON.stringify(this.selectAllRows));
=======
    this.originalPermissions =
      JSON.parse(
        JSON.stringify(
          this.permissions
        )
      );

    this.originalSelectAllRows =
      JSON.parse(
        JSON.stringify(
          this.selectAllRows
        )
      );
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  }

  // ============================================================
  // SELECT ALL INITIALIZATION
  // ============================================================

  private initializeSelectAllRows(): void {
<<<<<<< HEAD
    this.groupedModules.forEach((group) => {
      const groupName = this.typeGroupMap[group.type];

      this.permissionActions.forEach((action) => {
        const allChecked =
          group.modules.length > 0 &&
          group.modules.every((module) => this.permissions[module.name.trim()]?.[action] === true);

        this.selectAllRows[groupName][action] = allChecked;
      });
=======

    this.groupedModules.forEach(group => {

      const groupName =
        this.typeGroupMap[group.type];

      this.permissionActions.forEach(
        action => {

          const allChecked =
            group.modules.length > 0 &&
            group.modules.every(
              module =>
                this.permissions[
                module.name.trim()
                ]?.[action] === true
            );

          this.selectAllRows[
            groupName
          ][action] = allChecked;
        }
      );
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
    });
  }

  // ============================================================
  // GROUP SELECT ALL
  // ============================================================

<<<<<<< HEAD
  toggleGroupSelectAll(groupName: string, action: string): void {
    const group = this.groupedModules.find((g) => this.typeGroupMap[g.type] === groupName);
=======
  toggleGroupSelectAll(
    groupName: string,
    action: string
  ): void {

    const group =
      this.groupedModules.find(
        g =>
          this.typeGroupMap[g.type] ===
          groupName
      );
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a

    if (!group) {
      return;
    }

<<<<<<< HEAD
    const newValue = this.selectAllRows[groupName][action];

    const dependentActions = ['Add', 'Edit', 'Delete', 'Approve', 'Admin Approval', 'Export Excel'];

    group.modules.forEach((module) => {
      const moduleName = module.name.trim();
=======
    const newValue =
      this.selectAllRows[
      groupName
      ][action];

    const dependentActions = [
      'Add',
      'Edit',
      'Delete',
      'Approve',
      'Admin Approval',
      'Export Excel'
    ];

    group.modules.forEach(module => {

      const moduleName =
        module.name.trim();
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a

      if (!this.permissions[moduleName]) {
        return;
      }

<<<<<<< HEAD
      this.permissions[moduleName][action] = newValue;
=======
      this.permissions[
        moduleName
      ][action] = newValue;
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a

      /**
       * Any real permission automatically
       * enables View Only.
       */
<<<<<<< HEAD
      if (dependentActions.includes(action) && newValue) {
        this.permissions[moduleName]['View Only'] = true;
=======
      if (
        dependentActions.includes(action) &&
        newValue
      ) {

        this.permissions[
          moduleName
        ]['View Only'] = true;
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
      }

      /**
       * Remove View Only if no other
       * permission remains.
       */
<<<<<<< HEAD
      if (dependentActions.includes(action) && !newValue) {
        const hasOtherPermission = dependentActions.some((a) => this.permissions[moduleName][a]);

        if (!hasOtherPermission) {
          this.permissions[moduleName]['View Only'] = false;
=======
      if (
        dependentActions.includes(action) &&
        !newValue
      ) {

        const hasOtherPermission =
          dependentActions.some(
            a =>
              this.permissions[
              moduleName
              ][a]
          );

        if (!hasOtherPermission) {

          this.permissions[
            moduleName
          ]['View Only'] = false;
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
        }
      }
    });

    this.initializeSelectAllRows();
  }

  // ============================================================
  // SINGLE PERMISSION
  // ============================================================

<<<<<<< HEAD
  onPermissionChange(moduleName: string, action: string): void {
    const dependentActions = ['Add', 'Edit', 'Delete', 'Approve', 'Admin Approval', 'Export Excel'];
=======
  onPermissionChange(
    moduleName: string,
    action: string
  ): void {

    const dependentActions = [
      'Add',
      'Edit',
      'Delete',
      'Approve',
      'Admin Approval',
      'Export Excel'
    ];
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a

    /**
     * View Only checked:
     * remove other permissions.
     */
    if (action === 'View Only') {
<<<<<<< HEAD
      if (this.permissions[moduleName]['View Only']) {
        dependentActions.forEach((permission) => {
          this.permissions[moduleName][permission] = false;
        });
=======

      if (
        this.permissions[
        moduleName
        ]['View Only']
      ) {

        dependentActions.forEach(
          permission => {

            this.permissions[
              moduleName
            ][permission] = false;
          }
        );
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
      }
    }

    /**
     * Any actual permission:
     * View Only automatically checked.
     */
<<<<<<< HEAD
    if (dependentActions.includes(action)) {
      if (this.permissions[moduleName][action]) {
        this.permissions[moduleName]['View Only'] = true;
=======
    if (
      dependentActions.includes(action)
    ) {

      if (
        this.permissions[
        moduleName
        ][action]
      ) {

        this.permissions[
          moduleName
        ]['View Only'] = true;
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
      }
    }

    this.initializeSelectAllRows();
  }

  // ============================================================
  // CLEAR PERMISSIONS
  // ============================================================

  private clearAllPermissions(): void {
<<<<<<< HEAD
    Object.keys(this.permissions).forEach((moduleName) => {
      this.permissionActions.forEach((action) => {
        this.permissions[moduleName][action] = false;
      });
    });

    Object.keys(this.selectAllRows).forEach((groupName) => {
      this.permissionActions.forEach((action) => {
        this.selectAllRows[groupName][action] = false;
      });
=======

    Object.keys(
      this.permissions
    ).forEach(moduleName => {

      this.permissionActions.forEach(
        action => {

          this.permissions[
            moduleName
          ][action] = false;
        }
      );
    });

    Object.keys(
      this.selectAllRows
    ).forEach(groupName => {

      this.permissionActions.forEach(
        action => {

          this.selectAllRows[
            groupName
          ][action] = false;
        }
      );
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
    });
  }

  // ============================================================
  // SUBMIT
  // ============================================================

  onSubmit(): void {
<<<<<<< HEAD
=======

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
    if (this.isSubmitting) {
      return;
    }

    this.userForm.markAllAsTouched();

<<<<<<< HEAD
    if (this.userForm.invalid) {
      return;
    }
=======
     console.log('========== FORM DEBUG ==========');
  console.log('FORM VALID:', this.userForm.valid);
  console.log('FORM VALUE:', this.userForm.value);

   Object.keys(this.userForm.controls).forEach(key => {
    const control = this.userForm.get(key);

    console.log(
      key,
      'value:', control?.value,
      'valid:', control?.valid,
      'errors:', control?.errors
    );
  });

  if (this.userForm.invalid) {
    console.error('FORM IS INVALID - API WILL NOT BE CALLED');
    return;
  }

  console.log('FORM IS VALID - CALLING API');

    // if (this.userForm.invalid) {
    //   return;
    // }
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a

    if (!this.validateExpiryDate()) {
      return;
    }

    this.isSubmitting = true;

<<<<<<< HEAD
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
=======
    const formValues =
      this.userForm.value;

    let formattedExpiryDate =
      formValues.expiryDate;

    if (formattedExpiryDate) {

      const parts =
        formattedExpiryDate.split('-');

      if (parts.length === 3) {

        formattedExpiryDate =
          `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    console.log('Department ID:', formValues.departmentId);
    const payload: any = {

      userId: this.isEditMode
        ? this.userId
        : 0,

      firstName:
        formValues.name.trim(),

      mobileNo:
        formValues.mobile,

      email:
        formValues.email
          .trim()
          .toLowerCase(),

      expiryDate:
        formattedExpiryDate,

      permission:
        formValues.isAdmin
          ? 'Y'
          : 'N',

      status:
        Number(formValues.status),

      departmentId: Number(formValues.departmentId),
      designationId: Number(formValues.desigmationId),
      qcFlag: 0,

      telephone:
        formValues.telephone || '',

      createdBy:
        this.createdBy,

      module:
        this.buildModulePermissions()
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
    };

    /**
     * Password:
     *
     * Add -> send password
     * Edit -> send only if user entered one
     */
<<<<<<< HEAD
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
=======
    if (
      formValues.password &&
      formValues.password.trim()
    ) {

      payload.password =
        formValues.password;
    }

    this.dataProvider
      .saveUserManagementDetailsDetail(
        payload
      )
      .subscribe({

        next: (response: any) => {

          this.isSubmitting = false;

          if (
            response?.success === false
          ) {

            alert(
              response.message ||
              'Operation failed.'
            );

            return;
          }

          alert(
            this.isEditMode
              ? 'User updated successfully!'
              : 'User saved successfully!'
          );

          this.backToIndexPage();
        },

        error: (err) => {

          this.isSubmitting = false;

          console.error(
            'Save user error:',
            err
          );

          alert(
            err?.error?.message ||
            (
              this.isEditMode
                ? 'Failed to update user.'
                : 'Failed to save user.'
            )
          );
        }
      });
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  }

  // ============================================================
  // BUILD API PERMISSIONS
  // ============================================================

  private buildModulePermissions(): any[] {
<<<<<<< HEAD
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
=======
    return this.groupedModules
      .flatMap(group =>
        group.modules.map(module => {

          const moduleName =
            module.name.trim();

          const permission =
            this.permissions[
            moduleName
            ] || {};

          return {

            moduleId:
              module.moduleId?.toString(),

            addPer:
              permission['Add']
                ? 'Y'
                : 'N',

            editPer:
              permission['Edit']
                ? 'Y'
                : 'N',

            deletePer:
              permission['Delete']
                ? 'Y'
                : 'N',

            approvePer:
              permission['Approve']
                ? 'Y'
                : 'N',

            adminApprovePer:
              permission[
                'Admin Approval'
              ]
                ? 'Y'
                : 'N',

            viewPer:
              permission['View Only']
                ? 'Y'
                : 'N',

            exportExcel:
              permission['Export Excel']
                ? 'Y'
                : 'N'
          };
        })
      );
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  }

  // ============================================================
  // RESET
  // ============================================================

  onReset(): void {
<<<<<<< HEAD
    if (this.isEditMode) {
=======

    if (this.isEditMode) {

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
      this.loadUserDetails();

      return;
    }

    this.userForm.reset({
<<<<<<< HEAD
=======

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
      name: '',

      email: '',

<<<<<<< HEAD
      expiryDate: this.formatDate(new Date('2050-12-31')),
=======
      expiryDate:
        this.formatDate(
          new Date('2050-12-31')
        ),
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a

      password: '',

      mobile: '',

      telephone: '',

      status: 1,

      isAdmin: false,
<<<<<<< HEAD
    });

    this.permissions = JSON.parse(JSON.stringify(this.originalPermissions));

    this.selectAllRows = JSON.parse(JSON.stringify(this.originalSelectAllRows));
=======
      departmentId: null,
  desigmationId: null
    });

    this.permissions =
      JSON.parse(
        JSON.stringify(
          this.originalPermissions
        )
      );

    this.selectAllRows =
      JSON.parse(
        JSON.stringify(
          this.originalSelectAllRows
        )
      );
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  }

  // ============================================================
  // BACK
  // ============================================================

  backToIndexPage(): void {
<<<<<<< HEAD
    this.router.navigate(['/my-team'], {
      state: {
        currentPage: this.currentPage,
        statusIndex: this.statusIndex,
        searchText: this.searchText,
        size: this.size,
      },
    });
=======

    this.router.navigate(
      ['/my-team'],
      {
        state: {

          currentPage:
            this.currentPage,

          statusIndex:
            this.statusIndex,

          searchText:
            this.searchText,

          size:
            this.size
        }
      }
    );
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
  }

  // ============================================================
  // FILTER STATE
  // ============================================================

  private readFilterState(): void {
<<<<<<< HEAD
    let stateData: any = null;

    const navigation = this.router.getCurrentNavigation();

    stateData = navigation?.extras?.state;

    if (!stateData && isPlatformBrowser(this.platformId)) {
      const saved = sessionStorage.getItem('userFilters');

      if (saved) {
        try {
          stateData = JSON.parse(saved);
=======

    let stateData: any = null;

    const navigation =
      this.router.getCurrentNavigation();

    stateData =
      navigation?.extras?.state;

    if (!stateData &&
      isPlatformBrowser(this.platformId)) {

      const saved =
        sessionStorage.getItem(
          'userFilters'
        );

      if (saved) {

        try {
          stateData =
            JSON.parse(saved);
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
        } catch {
          stateData = null;
        }
      }
    }

    if (stateData) {
<<<<<<< HEAD
      this.currentPage = stateData.currentPage ?? 1;

      this.statusIndex = stateData.statusIndex ?? 0;

      this.searchText = stateData.searchText ?? '';

      this.size = stateData.size ?? 10;
=======

      this.currentPage =
        stateData.currentPage ?? 1;

      this.statusIndex =
        stateData.statusIndex ?? 0;

      this.searchText =
        stateData.searchText ?? '';

      this.size =
        stateData.size ?? 10;
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
    }
  }

  // ============================================================
  // VALIDATION
  // ============================================================

  validateExpiryDate(): boolean {
<<<<<<< HEAD
    const value = this.userForm.get('expiryDate')?.value;

    if (!value) {
      alert('Please select a valid Expiry Date.');
=======

    const value =
      this.userForm
        .get('expiryDate')
        ?.value;

    if (!value) {

      alert(
        'Please select a valid Expiry Date.'
      );
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a

      return false;
    }

<<<<<<< HEAD
    const parts = value.split('-').map(Number);

    if (parts.length !== 3) {
      alert('Please select a valid Expiry Date.');
=======
    const parts =
      value.split('-').map(Number);

    if (parts.length !== 3) {

      alert(
        'Please select a valid Expiry Date.'
      );
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a

      return false;
    }

<<<<<<< HEAD
    const [day, month, year] = parts;

    const enteredDate = new Date(year, month - 1, day);

    enteredDate.setHours(0, 0, 0, 0);

    const min = new Date(this.minDate);

    min.setHours(0, 0, 0, 0);

    if (enteredDate < min) {
      alert('Expiry Date cannot be a past date.');
=======
    const [
      day,
      month,
      year
    ] = parts;

    const enteredDate =
      new Date(
        year,
        month - 1,
        day
      );

    enteredDate.setHours(
      0,
      0,
      0,
      0
    );

    const min =
      new Date(this.minDate);

    min.setHours(
      0,
      0,
      0,
      0
    );

    if (enteredDate < min) {

      alert(
        'Expiry Date cannot be a past date.'
      );
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a

      return false;
    }

    return true;
  }

  // ============================================================
  // DATE
  // ============================================================

  private formatDate(date: Date): string {
<<<<<<< HEAD
    const day = ('0' + date.getDate()).slice(-2);

    const month = ('0' + (date.getMonth() + 1)).slice(-2);

    const year = date.getFullYear();
=======

    const day =
      ('0' + date.getDate())
        .slice(-2);

    const month =
      ('0' + (date.getMonth() + 1))
        .slice(-2);

    const year =
      date.getFullYear();
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a

    return `${day}-${month}-${year}`;
  }

<<<<<<< HEAD
  private formatDateToDDMMYYYY(dateStr: string): string {
=======
  private formatDateToDDMMYYYY(
    dateStr: string
  ): string {

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
    if (!dateStr) {
      return '';
    }

<<<<<<< HEAD
    const date = new Date(dateStr);
=======
    const date =
      new Date(dateStr);
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a

    if (isNaN(date.getTime())) {
      return '';
    }

    return this.formatDate(date);
  }

  // ============================================================
  // INPUT RESTRICTIONS
  // ============================================================

<<<<<<< HEAD
  allowOnlyLetters(event: KeyboardEvent): void {
    const char = event.key;

    if (!/^[a-zA-Z\s]$/.test(char)) {
=======
  allowOnlyLetters(
    event: KeyboardEvent
  ): void {

    const char =
      event.key;

    if (
      !/^[a-zA-Z\s]$/.test(char)
    ) {

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
      event.preventDefault();
    }
  }

<<<<<<< HEAD
  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.which || event.keyCode;

    if (charCode < 48 || charCode > 57) {
=======
  allowOnlyNumbers(
    event: KeyboardEvent
  ): void {

    const charCode =
      event.which ||
      event.keyCode;

    if (
      charCode < 48 ||
      charCode > 57
    ) {

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
      event.preventDefault();
    }
  }

<<<<<<< HEAD
  allowOnlyDateChars(event: KeyboardEvent): void {
    const char = event.key;
=======
  allowOnlyDateChars(
    event: KeyboardEvent
  ): void {

    const char =
      event.key;
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a

    if (
      !/[0-9\-\/]/.test(char) &&
      char !== 'Backspace' &&
      char !== 'Delete' &&
      char !== 'Tab' &&
      !event.ctrlKey &&
      !event.metaKey &&
<<<<<<< HEAD
      !['ArrowLeft', 'ArrowRight'].includes(char)
    ) {
=======
      ![
        'ArrowLeft',
        'ArrowRight'
      ].includes(char)
    ) {

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
      event.preventDefault();
    }
  }

  // ============================================================
  // STATUS
  // ============================================================

<<<<<<< HEAD
  getStatusLabel(status: number): string {
    switch (+status) {
=======
  getStatusLabel(
    status: number
  ): string {

    switch (+status) {

>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
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
<<<<<<< HEAD
}
=======
  departmentList: DepartmentDTO[] = [];

  designationList: DesignationDTO[] = [];

  loadDepartments(): void {
    this.dataProvider.getActiveDepartments().subscribe({
      next: (response: DepartmentDTO[]) => {
        this.departmentList = response;
      },
      error: (error) => {
        console.error('Error loading departments', error);
      }
    });
  }

  loadDesignations(): void {
    this.dataProvider.getActiveDesigmations().subscribe({
      next: (response: DesignationDTO[]) => {
        this.designationList = response;
      },
      error: (error) => {
        console.error('Error loading departments', error);
      }
    });
  }

}
>>>>>>> 590e00116e228cab563fa3e07925ba38a258884a
