import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { DataProviderService } from '../../../service/data-provider.service';
import Swal from 'sweetalert2';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-add-designation',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './add-designation.html',
  styleUrl: './add-designation.scss',
})
export class AddDesignation implements OnInit {
  designation: any = {};
  originalDesignation: any = {};

  userId: any;

  isEditMode: boolean = false;

  nameError: string = '';

  currentPage: number = 1;
  searchText: string = '';
  statusIndex: number = 0;
  page: number = 0;
  size: number = 5;

  constructor(
    private route: ActivatedRoute,
    private dataprovider: DataProviderService,
    @Inject(PLATFORM_ID)
    private platformId: Object,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // const queryParams = this.route.snapshot.queryParamMap;

    // this.currentPage = Number(queryParams.get('currentPage')) || 1;
    // this.searchText = queryParams.get('searchText') || '';
    // this.statusIndex = Number(queryParams.get('statusIndex')) || 0;
    // this.page = Number(queryParams.get('page')) || this.currentPage - 1;
    // this.size = Number(queryParams.get('size')) || 5;

    if (isPlatformBrowser(this.platformId)) {
      this.userId = sessionStorage.getItem('userId');
    }

    const desigmationId = this.route.snapshot.params['designationId'];

    if (desigmationId) {
      this.isEditMode = true;

      this.dataprovider.getDesigmationById(desigmationId).subscribe({
        next: (res) => {
          if (res && res.data) {
            this.designation = {
              ...res.data,
              sequence: Number(res.data.sequence),
            };

            this.originalDesignation = {
              ...this.designation,
            };
          }
        },

        error: (error) => {
          console.error('Error fetching designation:', error);

          Swal.fire('Error', 'Unable to fetch designation details.', 'error');
        },
      });
    } else {
      this.designation = {
        name: '',
        sequence: null,
        status: 1,
      };
    }
  }

  capitalizeFirstCharOnly(value: string): string {
    if (!value) {
      return '';
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  onSubmit(form: any): void {
    if (form.invalid || this.nameError) {
      form.control.markAllAsTouched();

      return;
    }

    if (this.designation.name) {
      this.designation.name = this.designation.name.trim();
    }

    this.designation.sequence = Number(this.designation.sequence);
    this.designation.userId = this.userId ? Number(this.userId) : null;

    if (
      this.isEditMode &&
      this.designation.status !== null &&
      this.designation.status !== undefined
    ) {
      this.designation.status = Number(this.designation.status);
    }

    if (!this.isEditMode) {
      this.designation.status = 1;
    }

    console.log('Designation payload:', this.designation);

    this.dataprovider.saveDesigmation(this.designation).subscribe({
      next: (response) => {
        if (response.success) {
          Swal.fire('Success', response.message, 'success');

          this.onReset();
          this.backToIndexPage();
        } else {
          Swal.fire('Error', response.message, 'error');
        }
      },

      error: (err) => {
        console.error('Error saving designation:', err);

        Swal.fire('Error', 'Something went wrong while saving designation.', 'error');
      },
    });
  }

  onReset(): void {
    if (this.isEditMode) {
      this.designation = {
        ...this.originalDesignation,
      };
    } else {
      this.designation = {
        name: '',
        sequence: null,
        status: 1,
      };
    }

    this.nameError = '';
  }

  // backToIndexPage(): void {
  //   this.router.navigate(['/designation-master'], {
  //     queryParams: {
  //       currentPage: this.currentPage,
  //       statusIndex: this.statusIndex,
  //       searchText: this.searchText,
  //       size: this.size || 5,
  //     },
  //   });
  // }

  backToIndexPage(): void {
    this.router.navigate(['/designation-master']);
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const key = event.key;

    if (/^[0-9]$/.test(key)) {
      return;
    }
    event.preventDefault();
  }
}
