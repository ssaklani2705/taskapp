import { Component, inject } from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';

import { MatFormFieldModule } from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';

import { MatButtonModule } from '@angular/material/button';

import { MatCheckboxModule } from '@angular/material/checkbox';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../../core/services/auth';


@Component({
  selector: 'app-manager-login',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './manager-login.html',
  styleUrl: './manager-login.scss',
})
export class ManagerLogin {
  private readonly fb = inject(FormBuilder);

  private readonly authService =
    inject(AuthService);

  private readonly router =
    inject(Router);


  /* =====================================================
     LOGIN STATE
  ===================================================== */

  loading = false;

  errorMessage = '';

  hidePassword = true;


  /* =====================================================
     CAPTCHA
  ===================================================== */

  captchaText = '';

  captchaError = false;


  /* =====================================================
     LOGIN FORM
  ===================================================== */

  loginForm = this.fb.nonNullable.group({

    username: [
      '',
      Validators.required
    ],

    password: [
      '',
      Validators.required
    ],

    captcha: [
      '',
      Validators.required
    ],

    rememberMe: [
      false
    ]

  });


  constructor() {

    this.loadCaptcha();

  }


  /* =====================================================
     CAPTCHA GENERATION
  ===================================================== */

  loadCaptcha() {
    this.loginForm.get('captcha')?.reset('');

    this.authService.getCaptcha().subscribe({
      next: (res: { success: boolean; message: string; data: string }) => {
        if (res.success) {
          this.captchaText = res.data;
        }
      },
      error: (err: any) => {
        console.error('Error loading captcha:', err);
      }
    });
  }


  /* =====================================================
     CAPTCHA VALIDATION
  ===================================================== */

  validateCaptcha(): boolean {

    const enteredCaptcha =
      this.loginForm.controls.captcha
        .value
        .trim()
        .toUpperCase();


    if (!enteredCaptcha) {

      this.captchaError = true;

      return false;

    }


    if (enteredCaptcha !== this.captchaText) {

      this.captchaError = true;

      return false;

    }


    this.captchaError = false;

    return true;

  }


  /* =====================================================
     CAPTCHA INPUT CHANGE
  ===================================================== */

  onCaptchaInput(): void {

    this.captchaError = false;

  }


  /* =====================================================
     LOGIN
  ===================================================== */

onLogin(): void {
  this.errorMessage = '';
  this.captchaError = false;

  // Validate form
  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    return;
  }

  // Validate CAPTCHA
  if (!this.validateCaptcha()) {
    this.loginForm.controls.captcha.setValue('');
    return;
  }

  this.loading = true;
 const loginType = 'manager'; // manager / other
  const loginPayload = {
     logintype: loginType,
    username: this.loginForm.controls.username.value
      ?.trim()
      .toLowerCase(),

    password: this.loginForm.controls.password.value
      ?.trim(),

    captcha: this.loginForm.controls.captcha.value
      ?.trim()
      .toUpperCase(),

    captchaAns: this.captchaText
  };

  this.authService.login(loginPayload).subscribe({

    next: (res: any) => {

      this.loading = false;

      console.log('LOGIN RESPONSE:', res);

      if (res.success) {

        // ==========================================
        // SAVE SESSION - SAME AS OLD APPLICATION
        // ==========================================

        sessionStorage.setItem(
          'authToken',
          res.data.token
        );

        sessionStorage.setItem(
          'username',
          res.data.username
        );

        sessionStorage.setItem(
          'userId',
          res.data.userId
        );

        sessionStorage.setItem(
          'sessionId',
          res.data.sessionId
        );

        sessionStorage.setItem(
          'isAdmin',
          res.data.isAdmin
        );

        sessionStorage.setItem(
          'modules',
          JSON.stringify(res.data.modules)
        );

         // ==========================================
        // SAVE LOGIN TYPE
        // ==========================================

        sessionStorage.setItem(
          'loginType',
          loginType
        );

        // Clear previously selected module
        sessionStorage.removeItem(
          'selectedModuleDetail'
        );

        // Generate new CAPTCHA
        this.loadCaptcha();

        // ==========================================
        // REDIRECT
        // ==========================================

        this.router
          .navigate(['/dashboard'])
          .then(result => {

            console.log(
              'Navigation result:',
              result
            );

            console.log(
              'Current URL:',
              this.router.url
            );

          })
          .catch(error => {

            console.error(
              'Navigation error:',
              error
            );

          });

      } else {

        this.errorMessage =
          res.message ||
          'Invalid login credentials';

        // Refresh CAPTCHA
        this.loadCaptcha();
      }
    },

    error: (error) => {

      this.loading = false;

      console.error(
        'LOGIN ERROR:',
        error
      );

      this.errorMessage =
        error?.error?.message ||
        'Invalid username or password. Please try again.';

      // Refresh CAPTCHA
      this.loadCaptcha();
    }

  });
}

  /* =====================================================
     PASSWORD
  ===================================================== */

  togglePassword(): void {

    this.hidePassword =
      !this.hidePassword;

  }


  /* =====================================================
     FORGOT PASSWORD
  ===================================================== */

  forgotPassword(): void {

    console.log(
      'Forgot password clicked'
    );

    // this.router.navigate(['/forgot-password']);

  }


  /* =====================================================
     SIGN UP
  ===================================================== */

  signUp(): void {

    console.log(
      'Create account clicked'
    );

    // this.router.navigate(['/register']);

  }

}