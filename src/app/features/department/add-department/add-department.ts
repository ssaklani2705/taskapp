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
  selector: 'app-add-department',
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatIconModule],
  templateUrl: './add-department.html',
  styleUrl: './add-department.scss',
})
export class AddDepartmentComponent implements OnInit {

  department: any = {};
  originalDepartment: any = {};
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
    const savedFilter = sessionStorage.getItem('departmentMasterFilter');
    if (savedFilter) {
      const filter = JSON.parse(savedFilter);
      this.currentPage = filter.currentPage || 1;
      this.searchText = filter.searchText || '';
      this.statusIndex = filter.statusIndex || 0;
      this.page = filter.page || this.currentPage - 1;
      this.size = filter.size || 5;
    }
    if (isPlatformBrowser(this.platformId)) {
      this.userId = sessionStorage.getItem('userId');
    }

    const departmentId = this.route.snapshot.params['departmentId'];
    if (departmentId) {
      this.isEditMode = true;
      this.dataprovider.getDepartmentById(departmentId).subscribe({
        next: (res) => {
          if (res && res.data) {
            this.department = res.data;
            this.originalDepartment = {
              ...res.data,
            };
          }
        },
        error: (error) => {
          console.error('Error fetching department:', error);
          // Swal.fire('Error', 'Unable to load department details.', 'error');
        },
      });
    }
    else {
      this.isEditMode = false;
      this.department = {
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
    this.department.userId = this.userId ? Number(this.userId) : null;
    if (this.department.sequence !== null && this.department.sequence !== undefined && this.department.sequence !== '') {
      this.department.sequence = Number(this.department.sequence);
    }
    this.dataprovider.saveDepartment(this.department).subscribe({
      next: (response) => {
        if (response.success) {
          Swal.fire('Success', response.message, 'success');
          this.onReset();
          this.backToIndexPage();
        }
        else {
          Swal.fire('Error', response.message, 'error');
        }
      },
      error: (err) => {
        console.error('Error saving department:', err);
        // Swal.fire('Error', 'Something went wrong', 'error');
      },
    });
  }

  onReset(): void {
    if (this.isEditMode) {
      this.department = {
        ...this.originalDepartment,
      };
    }
    else {
      this.department = {
        name: '',
        sequence: null,
        status: 1,
      };
    }
    this.nameError = '';
  }

  backToIndexPage(): void {
    this.router.navigate(['/department-master']);
  }
}
