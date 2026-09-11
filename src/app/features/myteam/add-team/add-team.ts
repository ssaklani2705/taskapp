import {
  AfterViewInit,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
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

import {
  FormBuilder,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
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
    MatNativeDateModule
  ],
  templateUrl: './add-team.html',
  styleUrl: './add-team.scss',
  encapsulation: ViewEncapsulation.Emulated,

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
    'Export Excel'
  ];

  /**
   * API permission names
   */
  permissionApiMap: any = {
    'Add': 'addPer',
    'Edit': 'editPer',
    'Delete': 'deletePer',
    'Approve': 'approvePer',
    'Admin Approval': 'adminApprovePer',
    'View Only': 'viewPer',
    'Export Excel': 'exportExcel'
  };

  /**
   * Group names
   */
  typeGroupMap: {
    [key: number]: string
  } = {
      1: 'Masters',
      2: 'Activity',
      3: 'Reports - 1'
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
    private platformId: Object
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
  null,
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
  }

  // ============================================================
  // INIT
  // ============================================================

  // ngOnInit(): void {

  //   if (isPlatformBrowser(this.platformId)) {
  //     this.createdBy = sessionStorage.getItem('userId');
  //   }

  //   this.readFilterState();

  //   const id = this.route.snapshot.paramMap.get('userId');

  //   if (id) {

  //     this.isEditMode = true;

  //     this.userId = Number(id);

  //     this.loadUserDetails();

  //   } else {

  //     this.isEditMode = false;

  //     this.userId = 0;

  //     this.setupAddMode();
  //   }

  //   this.loadDepartments();
  //   this.loadDesignations();
  // }

  ngOnInit(): void {

  if (isPlatformBrowser(this.platformId)) {
    this.createdBy = sessionStorage.getItem('userId');
  }

  this.readFilterState();

  const id = this.route.snapshot.paramMap.get('userId');

  if (id) {

    this.isEditMode = true;
    this.userId = Number(id);

    // this.isEditMode = true;

  this.userForm.get('departmentId')?.disable();
  this.userForm.get('desigmationId')?.disable();

    // First load dropdowns
    this.loadDepartments();
    this.loadDesignations();

    // Then load user
    this.loadUserDetails();

  } else {

    this.isEditMode = false;
    this.userId = 0;

    this.setupAddMode();

    this.loadDepartments();
    this.loadDesignations();
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

    }, 100);
  }

  // ============================================================
  // ADD MODE
  // ============================================================

  private setupAddMode(): void {

  this.userForm
    .get('password')
    ?.setValidators([
      Validators.required,
      Validators.minLength(6)
    ]);

  this.userForm
    .get('password')
    ?.updateValueAndValidity();


  const defaultDate =
    new Date(
      2050,
      11,
      31
    );

  defaultDate.setHours(
    0,
    0,
    0,
    0
  );


  this.userForm.patchValue({

    status: 1,

    isAdmin: false,

    expiryDate: defaultDate

  });


  this.loadPermissionModules(0);
}

  // ============================================================
  // EDIT MODE
  // ============================================================

  private loadUserDetails(): void {

    this.dataProvider
      .getUserManagementDetailsById(this.userId)
      .subscribe({

        next: (response: any) => {
// alert( response.designationId);
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

  name:
    response.firstName || '',

  email:
    response.email || '',

  mobile:
    response.mobileNo || '',

  telephone:
    response.telephone &&
    response.telephone !== 'NA'
      ? response.telephone
      : '',

  expiryDate:
    this.parseExpiryDate(
      response.expiryDate
    ),

  status:
    Number(response.status) || 1,

  isAdmin:
    response.permission === 'Y',

  departmentId:
    response.departmentId || null,

  desigmationId:
    response.designationId || null

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
  }

  // ============================================================
  // LOAD PERMISSION MODULES
  // ============================================================

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
  }

  // ============================================================
  // BUILD GROUPS
  // ============================================================

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

      if (!grouped[module.type]) {
        grouped[module.type] = [];
      }

      grouped[module.type].push(module);
    });

    this.groupedModules =
      Object.keys(grouped)
        .map(type => ({
          type: Number(type),
          modules: grouped[Number(type)]
        }));

    this.permissions = {};

    this.selectAllRows = {};

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
      });
    });

    this.initializeSelectAllRows();

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
  }

  // ============================================================
  // SELECT ALL INITIALIZATION
  // ============================================================

  private initializeSelectAllRows(): void {

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
    });
  }

  // ============================================================
  // GROUP SELECT ALL
  // ============================================================

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

    if (!group) {
      return;
    }

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

      if (!this.permissions[moduleName]) {
        return;
      }

      this.permissions[
        moduleName
      ][action] = newValue;

      /**
       * Any real permission automatically
       * enables View Only.
       */
      if (
        dependentActions.includes(action) &&
        newValue
      ) {

        this.permissions[
          moduleName
        ]['View Only'] = true;
      }

      /**
       * Remove View Only if no other
       * permission remains.
       */
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
        }
      }
    });

    this.initializeSelectAllRows();
  }

  // ============================================================
  // SINGLE PERMISSION
  // ============================================================

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

    /**
     * View Only checked:
     * remove other permissions.
     */
    if (action === 'View Only') {

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
      }
    }

    /**
     * Any actual permission:
     * View Only automatically checked.
     */
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
      }
    }

    this.initializeSelectAllRows();
  }

  // ============================================================
  // CLEAR PERMISSIONS
  // ============================================================

  private clearAllPermissions(): void {

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
    });
  }

  // ============================================================
  // SUBMIT
  // ============================================================

//  onSubmit(): void {

//   // ============================================================
//   // PREVENT DOUBLE SUBMIT
//   // ============================================================

//   if (this.isSubmitting) {
//     return;
//   }


//   // ============================================================
//   // MARK FORM AS TOUCHED
//   // ============================================================

//   this.userForm.markAllAsTouched();


//   // ============================================================
//   // FORM DEBUG
//   // ============================================================

//   console.log('========== FORM DEBUG ==========');

//   console.log(
//     'FORM VALID:',
//     this.userForm.valid
//   );

//   console.log(
//     'FORM VALUE:',
//     this.userForm.value
//   );


//   Object.keys(
//     this.userForm.controls
//   ).forEach(key => {

//     const control =
//       this.userForm.get(key);

//     console.log(
//       key,
//       'value:',
//       control?.value,
//       'valid:',
//       control?.valid,
//       'errors:',
//       control?.errors
//     );

//   });


//   // ============================================================
//   // FORM VALIDATION
//   // ============================================================

//   if (this.userForm.invalid) {

//     console.error(
//       'FORM IS INVALID - API WILL NOT BE CALLED'
//     );

//     return;
//   }


//   console.log(
//     'FORM IS VALID - CALLING API'
//   );


//   // ============================================================
//   // EXPIRY DATE VALIDATION
//   // ============================================================

//   if (!this.validateExpiryDate()) {

//     console.error(
//       'EXPIRY DATE VALIDATION FAILED'
//     );

//     return;
//   }


//   // ============================================================
//   // START SUBMITTING
//   // ============================================================

//   this.isSubmitting = true;


//   // ============================================================
//   // GET FORM VALUES
//   // ============================================================

//   const formValues =
//     this.userForm.value;


//   console.log(
//     'FORM VALUES BEFORE PAYLOAD:',
//     formValues
//   );


//   // ============================================================
//   // EXPIRY DATE
//   //
//   // Material Datepicker returns a Date object.
//   //
//   // Example:
//   // Sun Dec 31 2050 ...
//   //
//   // API will receive:
//   // 2050-12-31
//   // ============================================================

//   const formattedExpiryDate =
//     this.formatDateForApi(
//       formValues.expiryDate
//     );


//   console.log(
//     'Expiry Date - Date Object:',
//     formValues.expiryDate
//   );

//   console.log(
//     'Expiry Date - API Format:',
//     formattedExpiryDate
//   );


//   // ============================================================
//   // DEPARTMENT / DESIGNATION DEBUG
//   // ============================================================

//   console.log(
//     'Department ID:',
//     formValues.departmentId
//   );

//   console.log(
//     'Designation ID:',
//     formValues.desigmationId
//   );


//   // ============================================================
//   // BUILD PAYLOAD
//   // ============================================================

//   const payload: any = {

//     userId:
//       this.isEditMode
//         ? this.userId
//         : 0,


//     firstName:
//       formValues.name
//         ? formValues.name.trim()
//         : '',


//     mobileNo:
//       formValues.mobile || '',


//     email:
//       formValues.email
//         ? formValues.email
//             .trim()
//             .toLowerCase()
//         : '',


//     /*
//      * Material Datepicker Date
//      * converted to yyyy-MM-dd
//      */
//     expiryDate:
//       formattedExpiryDate,


//     permission:
//       formValues.isAdmin
//         ? 'Y'
//         : 'N',


//     status:
//       Number(
//         formValues.status
//       ),


//     departmentId:
//       Number(
//         formValues.departmentId
//       ),


//     designationId:
//       Number(
//         formValues.desigmationId
//       ),


//     qcFlag:
//       0,


//     telephone:
//       formValues.telephone || '',


//     createdBy:
//       this.createdBy,


//     module:
//       this.buildModulePermissions()

//   };


//   // ============================================================
//   // PASSWORD
//   //
//   // ADD:
//   //   password is mandatory
//   //
//   // EDIT:
//   //   password is sent only if user entered a new password
//   // ============================================================

//   if (
//     formValues.password &&
//     formValues.password.trim()
//   ) {

//     payload.password =
//       formValues.password.trim();

//   }


//   // ============================================================
//   // FINAL PAYLOAD DEBUG
//   // ============================================================

//   console.log(
//     '========== FINAL USER PAYLOAD =========='
//   );

//   console.log(
//     JSON.stringify(
//       payload,
//       null,
//       2
//     )
//   );


//   // ============================================================
//   // API CALL
//   // ============================================================

//   this.dataProvider
//     .saveUserManagementDetailsDetail(
//       payload
//     )
//     .subscribe({

//       // ========================================================
//       // SUCCESS
//       // ========================================================

//       next: (response: any) => {

//         this.isSubmitting = false;


//         console.log(
//           'SAVE USER RESPONSE:',
//           response
//         );


//         // ======================================================
//         // API RETURNED FAILURE
//         // ======================================================

//         if (
//           response?.success === false
//         ) {

//           alert(
//             response.message ||
//             'Operation failed.'
//           );

//           return;
//         }


//         // ======================================================
//         // SUCCESS MESSAGE
//         // ======================================================

//         alert(
//           this.isEditMode
//             ? 'User updated successfully!'
//             : 'User saved successfully!'
//         );


//         // ======================================================
//         // BACK TO INDEX
//         // ======================================================

//         this.backToIndexPage();

//       },


//       // ========================================================
//       // ERROR
//       // ========================================================

//       error: (err) => {

//         this.isSubmitting = false;


//         console.error(
//           'Save user error:',
//           err
//         );


//         console.error(
//           'HTTP STATUS:',
//           err?.status
//         );


//         console.error(
//           'ERROR BODY:',
//           err?.error
//         );


//         alert(
//           err?.error?.message ||
//           (
//             this.isEditMode
//               ? 'Failed to update user.'
//               : 'Failed to save user.'
//           )
//         );

//       }

//     });

// }

/**
 * Submit User
 */
onSubmit(): void {

  // ============================================================
  // PREVENT DOUBLE SUBMIT
  // ============================================================

  if (this.isSubmitting) {
    return;
  }


  // ============================================================
  // MARK FORM AS TOUCHED
  // ============================================================

  this.userForm.markAllAsTouched();


  // ============================================================
  // FORM DEBUG
  // ============================================================

  console.log('========== FORM DEBUG ==========');

  console.log(
    'FORM VALID:',
    this.userForm.valid
  );

  console.log(
    'FORM VALUE:',
    this.userForm.value
  );

  console.log(
    'FORM RAW VALUE:',
    this.userForm.getRawValue()
  );


  Object.keys(
    this.userForm.controls
  ).forEach(key => {

    const control =
      this.userForm.get(key);

    console.log(
      key,
      'value:',
      control?.value,
      'valid:',
      control?.valid,
      'disabled:',
      control?.disabled,
      'errors:',
      control?.errors
    );

  });


  // ============================================================
  // FORM VALIDATION
  // ============================================================

  if (this.userForm.invalid) {

    console.error(
      'FORM IS INVALID - API WILL NOT BE CALLED'
    );

    return;
  }


  console.log(
    'FORM IS VALID - CALLING API'
  );


  // ============================================================
  // EXPIRY DATE VALIDATION
  // ============================================================

  if (!this.validateExpiryDate()) {

    console.error(
      'EXPIRY DATE VALIDATION FAILED'
    );

    return;
  }


  // ============================================================
  // START SUBMITTING
  // ============================================================

  this.isSubmitting = true;


  // ============================================================
  // GET FORM VALUES
  //
  // IMPORTANT:
  //
  // getRawValue() includes disabled controls.
  //
  // This is required because Department and Designation
  // are disabled during EDIT mode.
  // ============================================================

  const formValues =
    this.userForm.getRawValue();


  console.log(
    'FORM RAW VALUES BEFORE PAYLOAD:',
    formValues
  );


  // ============================================================
  // EXPIRY DATE
  //
  // Material Datepicker Date
  // converted to yyyy-MM-dd
  // ============================================================

  const formattedExpiryDate =
    this.formatDateForApi(
      formValues.expiryDate
    );


  console.log(
    'Expiry Date - Date Object:',
    formValues.expiryDate
  );

  console.log(
    'Expiry Date - API Format:',
    formattedExpiryDate
  );


  // ============================================================
  // DEPARTMENT / DESIGNATION DEBUG
  // ============================================================

  console.log(
    'Department ID:',
    formValues.departmentId
  );

  console.log(
    'Designation ID:',
    formValues.desigmationId
  );


  // ============================================================
  // BUILD PAYLOAD
  // ============================================================

  const payload: any = {

    userId:
      this.isEditMode
        ? this.userId
        : 0,


    firstName:
      formValues.name
        ? formValues.name.trim()
        : '',


    mobileNo:
      formValues.mobile || '',


    email:
      formValues.email
        ? formValues.email.trim().toLowerCase()
        : '',


    // Material Datepicker Date
    // converted to yyyy-MM-dd
    expiryDate:
      formattedExpiryDate,


    permission:
      formValues.isAdmin
        ? 'Y'
        : 'N',


    status:
      Number(
        formValues.status
      ),


    // IMPORTANT:
    // getRawValue() ensures these values are available
    // even when controls are disabled.
    departmentId:
      Number(
        formValues.departmentId
      ),


    designationId:
      Number(
        formValues.desigmationId
      ),


    qcFlag:
      0,


    telephone:
      formValues.telephone || '',


    createdBy:
      this.createdBy,


    module:
      this.buildModulePermissions()

  };


  // ============================================================
  // PASSWORD
  //
  // ADD:
  //   Password can be sent.
  //
  // EDIT:
  //   Password is sent only when user enters a new password.
  // ============================================================

  if (
    formValues.password &&
    formValues.password.trim()
  ) {

    payload.password =
      formValues.password.trim();

  }


  // ============================================================
  // FINAL PAYLOAD DEBUG
  // ============================================================

  console.log(
    '========== FINAL USER PAYLOAD =========='
  );

  console.log(
    JSON.stringify(
      payload,
      null,
      2
    )
  );


  // ============================================================
  // API CALL
  // ============================================================

  this.dataProvider
    .saveUserManagementDetailsDetail(
      payload
    )
    .subscribe({

      // ========================================================
      // SUCCESS
      // ========================================================

      next: (response: any) => {

        this.isSubmitting = false;


        console.log(
          'SAVE USER RESPONSE:',
          response
        );


        // ======================================================
        // API RETURNED FAILURE
        // ======================================================

        if (
          response?.success === false
        ) {

          alert(
            response.message ||
            'Operation failed.'
          );

          return;
        }


        // ======================================================
        // SUCCESS MESSAGE
        // ======================================================

        alert(
          this.isEditMode
            ? 'User updated successfully!'
            : 'User saved successfully!'
        );


        // ======================================================
        // BACK TO INDEX
        // ======================================================

        this.backToIndexPage();

      },


      // ========================================================
      // ERROR
      // ========================================================

      error: (err) => {

        this.isSubmitting = false;


        console.error(
          'Save user error:',
          err
        );


        console.error(
          'HTTP STATUS:',
          err?.status
        );


        console.error(
          'ERROR BODY:',
          err?.error
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

}


  // ============================================================
  // BUILD API PERMISSIONS
  // ============================================================

  private buildModulePermissions(): any[] {
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

      expiryDate:
        this.formatDate(
          new Date('2050-12-31')
        ),

      password: '',

      mobile: '',

      telephone: '',

      status: 1,

      isAdmin: false,
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
  }

  // ============================================================
  // BACK
  // ============================================================

  backToIndexPage(): void {

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
  }

  // ============================================================
  // FILTER STATE
  // ============================================================

  private readFilterState(): void {

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
        } catch {
          stateData = null;
        }
      }
    }

    if (stateData) {

      this.currentPage =
        stateData.currentPage ?? 1;

      this.statusIndex =
        stateData.statusIndex ?? 0;

      this.searchText =
        stateData.searchText ?? '';

      this.size =
        stateData.size ?? 10;
    }
  }

  // ============================================================
  // VALIDATION
  // ============================================================

validateExpiryDate(): boolean {

  const control =
    this.userForm.get('expiryDate');

  const value =
    control?.value;


  if (!value) {

    console.error(
      'Expiry Date is empty'
    );

    return false;
  }


  if (!(value instanceof Date)) {

    console.error(
      'Expiry Date is not a Date object:',
      value
    );

    return false;
  }


  if (
    isNaN(
      value.getTime()
    )
  ) {

    console.error(
      'Expiry Date is invalid:',
      value
    );

    return false;
  }


  const selectedDate =
    new Date(value);

  selectedDate.setHours(
    0,
    0,
    0,
    0
  );


  const minimumDate =
    new Date(this.minDate);

  minimumDate.setHours(
    0,
    0,
    0,
    0
  );


  if (
    selectedDate <
    minimumDate
  ) {

    control?.setErrors({
      ...(control.errors || {}),
      matDatepickerMin: true
    });


    alert(
      'Expiry Date cannot be a past date.'
    );


    return false;
  }


  return true;
}

  // ============================================================
  // DATE
  // ============================================================

  private formatDate(date: Date): string {

    const day =
      ('0' + date.getDate())
        .slice(-2);

    const month =
      ('0' + (date.getMonth() + 1))
        .slice(-2);

    const year =
      date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  private parseExpiryDate(value: any): Date | null {

  if (!value) {
    return null;
  }


  /* Already Date */

  if (value instanceof Date) {

    const date = new Date(value);

    date.setHours(
      0,
      0,
      0,
      0
    );

    return date;
  }


  const dateString =
    String(value).trim();


  /* =====================================================
     yyyy-MM-dd
     Example: 2050-12-31
     ===================================================== */

  const yyyyMmDd =
    /^(\d{4})-(\d{2})-(\d{2})$/;

  const yyyyMatch =
    dateString.match(yyyyMmDd);


  if (yyyyMatch) {

    const year =
      Number(yyyyMatch[1]);

    const month =
      Number(yyyyMatch[2]);

    const day =
      Number(yyyyMatch[3]);


    const date =
      new Date(
        year,
        month - 1,
        day
      );


    date.setHours(
      0,
      0,
      0,
      0
    );


    return date;
  }


  /* =====================================================
     dd-MM-yyyy
     Example: 31-12-2050
     ===================================================== */

  const ddMmYyyy =
    /^(\d{2})-(\d{2})-(\d{4})$/;

  const ddMatch =
    dateString.match(ddMmYyyy);


  if (ddMatch) {

    const day =
      Number(ddMatch[1]);

    const month =
      Number(ddMatch[2]);

    const year =
      Number(ddMatch[3]);


    const date =
      new Date(
        year,
        month - 1,
        day
      );


    date.setHours(
      0,
      0,
      0,
      0
    );


    return date;
  }


  /* =====================================================
     yyyy/MM/dd
     ===================================================== */

  const yyyySlash =
    /^(\d{4})\/(\d{2})\/(\d{2})$/;

  const slashMatch =
    dateString.match(yyyySlash);


  if (slashMatch) {

    const year =
      Number(slashMatch[1]);

    const month =
      Number(slashMatch[2]);

    const day =
      Number(slashMatch[3]);


    const date =
      new Date(
        year,
        month - 1,
        day
      );


    date.setHours(
      0,
      0,
      0,
      0
    );


    return date;
  }


  /* =====================================================
     Java date string
     
     Example:
     Wed Mar 13 00:00:00 IST 2024
     ===================================================== */

  let normalized =
    dateString.replace(
      ' IST ',
      ' GMT+0530 '
    );


  const parsed =
    new Date(normalized);


  if (
    !isNaN(
      parsed.getTime()
    )
  ) {

    parsed.setHours(
      0,
      0,
      0,
      0
    );


    return parsed;
  }


  console.error(
    'Unable to parse expiry date:',
    value
  );


  return null;
}

  // ============================================================
  // INPUT RESTRICTIONS
  // ============================================================

  allowOnlyLetters(
    event: KeyboardEvent
  ): void {

    const char =
      event.key;

    if (
      !/^[a-zA-Z\s]$/.test(char)
    ) {

      event.preventDefault();
    }
  }

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

      event.preventDefault();
    }
  }

  allowOnlyDateChars(
    event: KeyboardEvent
  ): void {

    const char =
      event.key;

    if (
      !/[0-9\-\/]/.test(char) &&
      char !== 'Backspace' &&
      char !== 'Delete' &&
      char !== 'Tab' &&
      !event.ctrlKey &&
      !event.metaKey &&
      ![
        'ArrowLeft',
        'ArrowRight'
      ].includes(char)
    ) {

      event.preventDefault();
    }
  }

  // ============================================================
  // STATUS
  // ============================================================

  getStatusLabel(
    status: number
  ): string {

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

private formatDateForApi(
  date: Date | null
): string {

  if (!date) {
    return '';
  }

  if (!(date instanceof Date)) {

    console.error(
      'Invalid expiry date:',
      date
    );

    return '';
  }

  if (isNaN(date.getTime())) {

    console.error(
      'Invalid expiry date:',
      date
    );

    return '';
  }

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, '0');

  const day =
    String(
      date.getDate()
    ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

}