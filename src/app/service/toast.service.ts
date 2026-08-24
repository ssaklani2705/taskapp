import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private baseToast = Swal.mixin({
  toast: true,
  position: 'bottom-end',  // bottom-right corner
  showConfirmButton: false,
  timer: 1000,
  timerProgressBar: true,
  customClass: {
    popup: 'small-toast'   // custom class for width control
  },
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});


  /** Green Success Toast */
  success(message: string, title: string = 'Success') {
    this.baseToast.fire({
      icon: 'success',
      title: message,
      background: '#158343e3',       // nice green shade
      color: '#fff',                // white text
      iconColor: '#fff',            // white icon
    });
  }

  /** Red Error Toast */
  error(message: string, title: string = 'Error') {
    this.baseToast.fire({
      icon: 'error',
      title: message,
      background: '#E74C3C',       //  red
      color: '#fff',
      iconColor: '#fff',
    });
  }

  /** Yellow Warning Toast */
  warning(message: string, title: string = 'Warning') {
    this.baseToast.fire({
      icon: 'warning',
      title: message,
      background: '#F1C40F',       //  yellow
      color: '#000',
      iconColor: '#000',
    });
  }

  /** ℹ️ Blue Info Toast */
  info(message: string, title: string = 'Info') {
    this.baseToast.fire({
      icon: 'info',
      title: message,
      background: '#3498DB',       // 🔵 blue
      color: '#fff',
      iconColor: '#fff',
    });
  }
}
