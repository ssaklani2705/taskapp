import { Component, EventEmitter, HostListener, Inject, OnInit, Output, PLATFORM_ID } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LoginService } from '../../service/login.service';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DataProviderService } from '../../service/data-provider.service';
import { NgForm, ReactiveFormsModule } from '@angular/forms';
import { AbstractControl, FormBuilder, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import Swal from 'sweetalert2';
import { CryptoService } from '../../service/CryptoService';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  changePasswordForm!: FormGroup;
  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  isChangingPassword = false;
  username: string = '';
  designationName: string = '';
  isAdmin: string = 'N';
  isHod: string = 'N';
  emailId:string =''

  showProfileMenu: boolean = false;
  showProfileModal: boolean = false;

  clientAssignmentMessage: string = '';
  userId: any;
  constructor(
    private router: Router,
    private loginService: LoginService,
    @Inject(PLATFORM_ID)
    private platformId: Object,
    private dataProvider: DataProviderService,
    private fb: FormBuilder,
    private cryptoService: CryptoService,
  ) {}

  @Output()
  menuToggle = new EventEmitter<void>();

  // username: string = '';
  // showProfileMenu: boolean = false;

  // ngOnInit(): void {
  //   this.username = sessionStorage.getItem('username') || '';
  // }

  ngOnInit(): void {
    this.username = sessionStorage.getItem('username') || '';
    this.emailId = sessionStorage.getItem('emailId') || '';

    this.designationName = sessionStorage.getItem('designationName') || '';
    this.isAdmin = sessionStorage.getItem('isAdmin') || 'N';
    this.isHod = sessionStorage.getItem('isHod') || 'N';
    this.userId = sessionStorage.getItem('userId');

    this.changePasswordForm = this.fb.group(
      {
        oldPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: [this.passwordMismatchValidator, this.differentPasswordValidator],
      },
    );
  }

  private checkClientAssignment(): void {
    const managerId = Number(sessionStorage.getItem('userId'));

    if (!managerId) {
      return;
    }

    this.dataProvider.checkClientAssignment(managerId).subscribe({
      next: (response: { assigned: boolean; message: string }) => {
        this.clientAssignmentMessage = response.assigned ? '' : response.message;
      },
      error: (err) => {
        console.error('Failed to check client assignment', err);
      },
    });
  }

  toggleMenu(): void {
    this.menuToggle.emit();
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  getInitials(name: string): string {
    if (!name) {
      return '';
    }

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  onLogout(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const loginType = sessionStorage.getItem('loginType') || 'other';

    const redirectUrl = loginType === 'manager' ? '/manager-login' : '/login';

    const logoutRequest = this.loginService.logout();

    if (!logoutRequest) {
      this.loginService.clearSession();

      this.router.navigate([redirectUrl]);

      return;
    }

    logoutRequest.subscribe({
      next: () => {
        this.loginService.clearSession();

        this.router.navigate([redirectUrl]);
      },
      error: () => {
        this.loginService.clearSession();

        this.router.navigate([redirectUrl]);
      },
    });
  }

  // onProfileClick(): void {
  //   this.closeProfileMenu();
  // }
  onProfileClick(): void {
    this.closeProfileMenu();
    this.showProfileModal = true;
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.profile-wrapper')) {
      this.closeProfileMenu();
    }
  }

  closeProfileMenu(): void {
    this.showProfileMenu = false;
  }

  showChangePasswordModal = false;

  changePasswordData = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  onChangePasswordClick(): void {
    this.resetChangePasswordForm();
    this.showChangePasswordModal = true;
  }

  closeChangePasswordModal(): void {
    if (this.isChangingPassword) {
      return;
    }

    this.showChangePasswordModal = false;
    this.resetChangePasswordForm();
  }

  resetChangePasswordForm(): void {
    if (this.changePasswordForm) {
      this.changePasswordForm.reset({
        emailId: '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      this.changePasswordForm.markAsPristine();
      this.changePasswordForm.markAsUntouched();
      this.changePasswordForm.updateValueAndValidity();
    }

    // Reset password visibility
    this.showOldPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;

    // Reset any loading state
    this.isChangingPassword = false;
  }

  submitChangePassword(): void {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    const formValue = this.changePasswordForm.getRawValue();

    const request = {
      oldPassword: this.cryptoService.cipher(formValue.oldPassword),
      newPassword: this.cryptoService.cipher(formValue.newPassword),
      username: this.cryptoService.cipher(this.emailId),
      userId: this.cryptoService.cipher(String(this.userId)),
    };

    this.dataProvider.updatePassword(request).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          Swal.fire('Success', response.message, 'success');
          this.resetChangePasswordForm();
          this.showChangePasswordModal = false;
        } else {
          const errorMessage = response?.data || response?.message || 'Unable to change password.';

          Swal.fire('Error', errorMessage, 'error');
        }
      },
      error: (error: any) => {
        console.error('Error changing password:', error);

        const errorMessage = error?.error?.data || error?.error?.message || error?.message || 'Something went wrong.';
        Swal.fire('Error', errorMessage, 'error');
      },
    });
  }

  private passwordMismatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!newPassword || !confirmPassword) {
      return null;
    }

    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  private differentPasswordValidator(control: AbstractControl): ValidationErrors | null {
    const oldPassword = control.get('oldPassword')?.value;
    const newPassword = control.get('newPassword')?.value;

    if (!oldPassword || !newPassword) {
      return null;
    }

    return oldPassword === newPassword ? { samePassword: true } : null;
  }

  onUserManualClick(): void {
  this.showProfileMenu = false;
  window.open('assets/docs/Society123_Task_App_User_Manual.pdf', '_blank', 'noopener');
}
}
