import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LoginService } from '../../service/login.service';
import { environment } from '../../../environments/environment';



@Component({
  selector: 'app-forget-password',
  imports: [CommonModule, ReactiveFormsModule, RouterModule], // ✅ Add ReactiveFormsModule here
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss'
})
export class ForgetPasswordComponent {
  forgetPasswordForm: FormGroup;
  submitted = false;

  emailId: string = '';
  userId: string = '';

  imgUrl: any = "";


  constructor(private fb: FormBuilder, private router: Router, private loginServic: LoginService, private route: ActivatedRoute) {
    this.forgetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Get from query params
    this.route.queryParams.subscribe(params => {
      this.emailId = params['emailId'] || '';
      this.userId = params['userId'] || '';
    });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  get f() { return this.forgetPasswordForm.controls; }



  onReset() {
    this.submitted = false;
    this.forgetPasswordForm.reset();
  }

  onSubmit() {
    this.submitted = true;

    // Basic validation
    const password = this.forgetPasswordForm.get('password')?.value?.trim();
    const confirmPassword = this.forgetPasswordForm.get('confirmPassword')?.value?.trim();

    // if (!password || !confirmPassword) {
    //   alert('Please enter both password and confirm password.');
    //   return;
    // }
    if (!password) {
      alert('Please enter password.');
      return;
    }

    if (!confirmPassword) {
      alert('Please enter confirm password.');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }


    if (!this.emailId || !this.userId) {
      alert('Missing reset details. Please try the reset link again.');
      return;
    }

    // Call API
    this.loginServic.forgotPassword(this.emailId, this.userId, password).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Password changed successfully!');
          this.router.navigate(['/login']);
        } else {
          alert(res.message || 'Password reset failed.');
        }
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Error while resetting password.');
      }
    });
  }


}