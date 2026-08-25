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
@Component({
  selector: 'app-add-client',
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
  templateUrl: './add-client.html',
  styleUrl: './add-client.scss',
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
export class AddClient implements OnInit {
  clientForm!: FormGroup;

  isEditMode = false;
  isSubmitting = false;

  userId = 0;
  clientId = 0;

  currentPage = 1;
  searchText = '';
  statusIndex = 0;
  size = 10;

  states: any[] = [];
  managers: any[] = [];

  minDate: Date = new Date();

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

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.userId = Number(sessionStorage.getItem('userId')) || 0;
    }

    this.loadStates();
    this.loadManagers();

    const id = this.route.snapshot.paramMap.get('clientId');

    if (id) {
      this.isEditMode = true;
      this.clientId = Number(id);

      this.loadClientDetails(this.clientId);
    } else {
      this.isEditMode = false;
      this.clientId = 0;

      this.setupAddMode();
    }
  }

  private setupAddMode(): void {
    this.clientForm.reset({
      name: '',
      code: '',
      pan: '',
      status: 1,

      gstFlag: false,
      gstNo: '',
      taxFlag: false,

      stateId: 0,
      managerId: 0,

      addressLine1: '',
      addressLine2: '',
      city: '',
      pincode: '',

      location: '',
      contactName: '',
      contactEmail: '',
      emails: '',

      startDate: null,
      monthlyCharge: 0,
      outstanding: 0,

      name1: '',
      emailId1: '',
      name2: '',
      emailId2: '',
      name3: '',
      emailId3: '',

      userId: this.userId,
    });

    this.clientForm.markAsPristine();
    this.clientForm.markAsUntouched();

    this.isSubmitting = false;
  }

  createForm(): void {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      code: ['', [Validators.required, Validators.maxLength(100)]],
      pan: ['', [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/)]],
      status: [1, Validators.required],
      gstFlag: [false],
      gstNo: [
        '',
        [
          Validators.maxLength(15),
          Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/),
        ],
      ],
      taxFlag: [false],
      stateId: [0, [Validators.required, Validators.min(1)]],
      managerId: [0, [Validators.required, Validators.min(1)]],
      addressLine1: ['', [Validators.required, Validators.maxLength(500)]],
      addressLine2: ['', Validators.maxLength(500)],
      city: ['', [Validators.required, Validators.maxLength(100)]],
      pincode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
      location: ['', Validators.maxLength(200)],
      contactName: ['', [Validators.required, Validators.maxLength(200)]],
      contactEmail: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
      emails: [''],
      startDate: [null, Validators.required],
      monthlyCharge: [0, [Validators.min(0)]],
      outstanding: [0, [Validators.min(0)]],
      name1: ['', Validators.maxLength(200)],
      emailId1: ['', Validators.email],
      name2: ['', Validators.maxLength(200)],
      emailId2: ['', Validators.email],
      name3: ['', Validators.maxLength(200)],
      emailId3: ['', Validators.email],
      userId: [0],
    });

    this.clientForm.get('gstFlag')?.valueChanges.subscribe((checked: boolean) => {
      const gstNoControl = this.clientForm.get('gstNo');

      if (checked) {
        gstNoControl?.setValidators([
          Validators.required,
          Validators.maxLength(15),
          Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/),
        ]);
      } else {
        gstNoControl?.setValidators([
          Validators.maxLength(15),
          Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/),
        ]);
      }

      gstNoControl?.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }

    this.clientForm.markAllAsTouched();

    if (this.clientForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    const formValues = this.clientForm.getRawValue();

    const payload: any = {
      clientId: this.isEditMode ? this.clientId : 0,

      name: formValues.name?.trim() || '',
      code: formValues.code?.trim() || '',
      pan: formValues.pan?.trim().toUpperCase() || '',

      status: Number(formValues.status),

      gstFlag: Number(formValues.gstFlag || 0),
      gstNo: formValues.gstNo?.trim() || '',

      stateId: Number(formValues.stateId || 0),

      addressLine1: formValues.addressLine1?.trim() || '',
      addressLine2: formValues.addressLine2?.trim() || '',
      city: formValues.city?.trim() || '',
      pincode: formValues.pincode?.trim() || '',

      contactName: formValues.contactName?.trim() || '',
      contactEmail: formValues.contactEmail?.trim().toLowerCase() || '',
      emails: formValues.emails?.trim() || '',

      startDate: this.formatDateForBackend(formValues.startDate),
      monthlyCharge: Number(formValues.monthlyCharge || 0),
      outstanding: Number(formValues.outstanding || 0),

      name1: formValues.name1?.trim() || '',
      emailId1: formValues.emailId1?.trim().toLowerCase() || '',

      name2: formValues.name2?.trim() || '',
      emailId2: formValues.emailId2?.trim().toLowerCase() || '',

      name3: formValues.name3?.trim() || '',
      emailId3: formValues.emailId3?.trim().toLowerCase() || '',

      managerId: Number(formValues.managerId || 0),

      userId: Number(formValues.userId || 0),

      taxFlag: Number(formValues.taxFlag || 0),
      location: formValues.location?.trim() || '',
    };

    console.log('Client payload:', payload);

    this.dataProvider.saveClient(payload).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;

        console.log('Save client response:', response);

        if (response?.success === false) {
          alert(response.message || 'Operation failed.');
          return;
        }

        alert(this.isEditMode ? 'Client updated successfully!' : 'Client saved successfully!');

        this.backToIndexPage();
      },
      error: (err) => {
        this.isSubmitting = false;

        console.error('Save client error:', err);

        alert(
          err?.error?.message ||
            (this.isEditMode ? 'Failed to update client.' : 'Failed to save client.'),
        );
      },
    });
  }

  private formatDateForBackend(date: Date | null): string | null {
    if (!date) {
      return null;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  loadStates(): void {
    this.dataProvider.getStates().subscribe({
      next: (response: any) => {
        this.states = response?.data || response || [];
      },
      error: (error) => {
        console.error('Error loading states:', error);
        this.states = [];
      },
    });
  }

  loadManagers(): void {
    this.dataProvider.getManagers().subscribe({
      next: (response: any) => {
        this.managers = response?.data || response || [];
      },
      error: (error) => {
        console.error('Error loading managers:', error);
        this.managers = [];
      },
    });
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.which || event.keyCode;

    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  loadClientDetails(clientId: number): void {
    this.dataProvider.getClientByClientId(clientId).subscribe({
      next: (response: any) => {
        console.log('Client response:', response);

        if (!response?.success || !response?.data) {
          console.error(response?.message || 'Client not found');
          return;
        }

        const client = response.data;

        this.clientForm.patchValue({
          clientId: client.clientId,

          name: client.name ?? '',
          code: client.code ?? '',
          pan: client.pan ?? '',

          status: client.status ?? 1,
          gstFlag: Number(client.gstFlag) === 1,
          gstNo: client.gstNo ?? '',
          taxFlag: Number(client.taxFlag) === 1,

          stateId: client.stateId ?? 0,
          managerId: client.managerId ?? 0,

          addressLine1: client.addressLine1 ?? '',
          addressLine2: client.addressLine2 ?? '',
          city: client.city ?? '',
          pincode: client.pincode ?? '',
          location: client.location ?? '',

          contactName: client.contactName ?? '',
          contactEmail: client.contactEmail ?? '',
          emails: client.emails ?? '',

          startDate: this.parseDate(client.startDate),
          monthlyCharge: client.monthlyCharge ?? 0,
          outstanding: client.outstanding ?? 0,

          name1: client.name1 ?? '',
          emailId1: client.emailId1 ?? '',

          name2: client.name2 ?? '',
          emailId2: client.emailId2 ?? '',

          name3: client.name3 ?? '',
          emailId3: client.emailId3 ?? '',

          userId: client.userId ?? 0,
        });

        console.log('Client form after patch:', this.clientForm.value);
      },
      error: (error) => {
        console.error('Error loading client:', error);
      },
    });
  }

  parseDate(date: any): Date | null {
    if (!date) {
      return null;
    }

    if (date instanceof Date) {
      return date;
    }

    if (typeof date === 'string') {
      if (date.includes('T')) {
        const datePart = date.split('T')[0];

        const [year, month, day] = datePart.split('-').map(Number);

        return new Date(year, month - 1, day);
      }

      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const [year, month, day] = date.split('-').map(Number);

        return new Date(year, month - 1, day);
      }

      if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
        const [day, month, year] = date.split('-').map(Number);

        return new Date(year, month - 1, day);
      }
    }

    return null;
  }

  onReset(): void {
    if (this.isSubmitting) {
      return;
    }

    if (this.isEditMode && this.clientId) {
      this.loadClientDetails(this.clientId);
      return;
    }

    this.setupAddMode();
  }

  backToIndexPage(): void {
    this.router.navigate(['/client-index'], {
      state: {
        currentPage: this.currentPage,
        statusIndex: this.statusIndex,
        searchText: this.searchText,
        size: this.size,
      },
    });
  }
}
