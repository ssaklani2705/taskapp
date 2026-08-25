import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { DataProviderService } from '../../../service/data-provider.service';
import Swal from 'sweetalert2';


export interface State {
  stateId: any
  name: string;
  code: string;
  status: any;
  userId: any
}
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
@Component({
  selector: 'app-state-add',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIcon,
    MatDivider
  ],
  templateUrl: './state-add.html',
  styleUrl: './state-add.scss',
})
export class StateAdd implements OnInit {

  state: State = {
    stateId: null,
    name: '',
    code: '',
    status: null,
    userId: null,
  };

  originalState: State = { ...this.state };

  userId: string | null = null;

  isEditMode = false;

  nameError = '';

  currentPage = 1;
  searchText = '';
  statusIndex = 0;
  page = 0;
  size = 5;

  constructor(
    private route: ActivatedRoute,
    private dataprovider: DataProviderService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
  ) { }

  ngOnInit(): void {

    /* --------------------------------
       Get pagination/filter parameters
    --------------------------------- */

    const queryParams = this.route.snapshot.queryParamMap;

    this.currentPage = Number(queryParams.get('currentPage')) || 1;
    this.searchText = queryParams.get('searchText') || '';
    this.statusIndex = Number(queryParams.get('statusIndex')) || 0;
    this.page = Number(queryParams.get('page')) || this.currentPage - 1;
    this.size = Number(queryParams.get('size')) || 5;

    /* --------------------------------
       User ID
    --------------------------------- */

    if (isPlatformBrowser(this.platformId)) {
      this.userId = sessionStorage.getItem('userId');
    }

    /* --------------------------------
       Check Edit Mode
    --------------------------------- */

    const stateId = this.route.snapshot.params['stateId'];
    console.log('Route params:', this.route.snapshot.params);
    console.log('stateId value:', stateId);

    if (stateId) {
      this.isEditMode = true;

      this.dataprovider.getStateById(stateId).subscribe({

        next: (res: ApiResponse<State>) => {
          if (res && res.data) {
            this.state = {
              stateId: res.data.stateId,
              name: res.data.name,
              code: res.data.code,
              status: res.data.status,
              userId: res.data.userId,
            };

            this.originalState = { ...this.state };
          }
        },

        error: (err) => {
          console.error('Failed to fetch state', err);
          Swal.fire('Error', 'Unable to load state', 'error');
        },

      });
    }
  }

  /* =========================================
     CAPITALIZE FIRST CHARACTER
  ========================================= */

  capitalizeFirstCharOnly(value: string): string {
    if (!value) {
      return '';
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  /* =========================================
     SUBMIT
  ========================================= */

  onSubmit(form: NgForm): void {

    if (form.invalid || this.nameError) {
      form.control.markAllAsTouched();
      return;
    }

    /* User ID */
    this.state.userId = this.userId ? Number(this.userId) : null;

    /* Save */
    this.dataprovider.saveState(this.state).subscribe({

      next: (response: ApiResponse<State>) => {
        if (response.success) {
          Swal.fire('Success', response.message, 'success');
          this.backToIndexPage();
        } else {
          Swal.fire('Error', response.message, 'error');
        }
      },

      error: (err) => {
        console.error('Save state error:', err);
        Swal.fire('Error', 'Something went wrong', 'error');
      },

    });
  }

  /* =========================================
     RESET
  ========================================= */

  onReset(): void {

    if (this.isEditMode) {

      this.state = { ...this.originalState };

    } else {

      this.state = {
        stateId: null,
        name: '',
        code: '',
        status: null,
        userId: null,
      };
    }

    this.nameError = '';
  }

  /* =========================================
     BACK TO INDEX
  ========================================= */

  backToIndexPage(): void {

    this.router.navigate(['/state-index'], {
      queryParams: {
        currentPage: this.currentPage,
        statusIndex: this.statusIndex,
        searchText: this.searchText,
        page: this.page,
        size: this.size || 5,
      },
    });
  }
}
