import { Component } from '@angular/core';
import { AfterViewInit, Inject, OnInit, PLATFORM_ID, ViewEncapsulation } from '@angular/core';
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
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { DateAdapter } from '@angular/material/core';
import { DataProviderService } from '../../../service/data-provider.service';
import { MyDateAdapter } from '../../../classes/my-date-adapter';
import Swal from 'sweetalert2';
import { MatRadioModule } from '@angular/material/radio';
@Component({
  selector: 'app-company-add',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule, // ADD THIS
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
  ],
  templateUrl: './company-add.html',
  styleUrl: './company-add.scss',
})
export class CompanyAdd implements OnInit {
  companyForm!: FormGroup;

  isEditMode = false;
  isSubmitting = false;

  userId = 0;
  companyId = 0;

  // Passed back to the index page to restore its state
  currentPage = 1;
  searchText = '';
  statusIndex = 0;
  size = 10;

  states: any[] = [];

  constructor(
    private fb: FormBuilder,
    private dataProvider: DataProviderService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.userId = Number(sessionStorage.getItem('userId')) || 0;
    }

    this.loadStates();

    const id = this.route.snapshot.paramMap.get('companyId');

    if (id) {
      this.isEditMode = true;
      this.companyId = Number(id);
      this.loadCompanyDetails(this.companyId);
    } else {
      this.setupAddMode();
    }
  }

  createForm(): void {
    this.companyForm = this.fb.group({
      companyName: ['', [Validators.required, Validators.maxLength(100)]],
      companySiteOffice: [1, Validators.required],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', [Validators.required, Validators.maxLength(100)]],
      pincode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
      location: ['', [Validators.required, Validators.maxLength(200)]],
      stateId: [null, Validators.required],
      // gstNo: ['', [Validators.maxLength(15), Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/)]],
      gstNo: [
  '',
  [
    Validators.required,
    Validators.maxLength(15),
    Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/)
  ]
],
      pan: ['', [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/)]],
      status: [1, Validators.required],
      workingDays: [[1, 2, 3, 4, 5, 6, 7], Validators.required],
    });
  }

  private setupAddMode(): void {
    this.companyForm.reset({
      companyName: '',
      companySiteOffice: 1,
      addressLine1: '',
      addressLine2: '',
      city: '',
      pincode: '',
      location: '',
      stateId: null,
      gstNo: '',
      pan: '',
      status: 1,
      workingDays: [1, 2, 3, 4, 5, 6, 7],
    });
    this.isSubmitting = false;
  }

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }
    this.companyForm.markAllAsTouched();
    if (this.companyForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const v = this.companyForm.getRawValue();

    const payload = {
      companyId: this.isEditMode ? this.companyId : 0,
      companyName: v.companyName?.trim() || '',
      // companySiteOffice: v.companySiteOffice?.trim() || '',
      companySiteOffice: Number(v.companySiteOffice),
      addressLine1: v.addressLine1?.trim() || '',
      addressLine2: v.addressLine2?.trim() || '',
      city: v.city?.trim() || '',
      pincode: v.pincode?.trim() || '',
      location: v.location?.trim() || '',
      stateId: Number(v.stateId || 0),
      gstNo: v.gstNo?.trim().toUpperCase() || '',
      pan: v.pan?.trim().toUpperCase() || '',
      status: Number(v.status),
      userId: this.userId,
      workingDays: (v.workingDays || []).join(','),
    };

    this.dataProvider.saveCompany(payload).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;

        if (response?.success === false) {
          Swal.fire({
            icon: 'error',
            title: 'Operation Failed',
            text: response.message || 'Unable to save company.',
            confirmButtonColor: '#d33',
          });
          return;
        }

        Swal.fire({
          icon: 'success',
          title: this.isEditMode ? 'Company Updated!' : 'Company Saved!',
          text: response?.message || 'Company saved successfully!',
          confirmButtonColor: '#3085d6',
        }).then((result) => {
          if (result.isConfirmed) {
            this.backToIndexPage();
          }
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'error',
          title: this.isEditMode ? 'Update Failed' : 'Save Failed',
          text: err?.error?.message || 'Failed to save company.',
          confirmButtonColor: '#d33',
        });
      },
    });
  }

  loadStates(): void {
    this.dataProvider.getStates().subscribe({
      next: (response: any) => (this.states = response?.data || response || []),
      error: () => (this.states = []),
    });
  }

  loadCompanyDetails(companyId: number): void {
    this.dataProvider.getCompanyById(companyId).subscribe({
      next: (response: any) => {
        if (!response?.success || !response?.data) {
          console.error(response?.message || 'Company not found');
          return;
        }

        const c = response.data;
        this.companyForm.patchValue({
          companyName: c.companyName ?? '',
          // companySiteOffice: c.companySiteOffice ?? '',
          companySiteOffice: Number(c.companySiteOffice ?? 1),
          workingDays: c.workingDays
          ? String(c.workingDays).split(',').map(Number)
          : [],
          addressLine1: c.addressLine1 ?? '',
          addressLine2: c.addressLine2 ?? '',
          city: c.city ?? '',
          pincode: c.pincode ?? '',
          location: c.location ?? '',
          stateId: c.stateId ?? null,
          gstNo: c.gstNo ?? '',
          pan: c.pan ?? '',
          status: c.status ?? 1,
        });
      },
      error: (error) => console.error('Error loading company:', error),
    });
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.which || event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  onReset(): void {
    if (this.isSubmitting) {
      return;
    }
    if (this.isEditMode && this.companyId) {
      this.loadCompanyDetails(this.companyId);
      return;
    }
    this.setupAddMode();
  }

  backToIndexPage(): void {
    this.router.navigate(['/company-index'], {
      state: {
        currentPage: this.currentPage,
        statusIndex: this.statusIndex,
        searchText: this.searchText,
        size: this.size,
      },
    });
  }

  workingDaysList = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
];

convertGSTToUppercase(): void {
  const control = this.companyForm.get('gstNo');

  if (control && control.value) {
    control.setValue(
      String(control.value).toUpperCase(),
      { emitEvent: false }
    );
  }
}
}
