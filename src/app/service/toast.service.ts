import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private baseToast = Swal.mixin({
    toast: true,
    position: 'bottom-end',

    showConfirmButton: false,

    timer: 1000,
    timerProgressBar: true,

    width: 'auto',
    padding: '6px 10px',

    customClass: {
      popup: 'small-toast'
    },

    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });

  /** Green Success Toast */
  success(message: string) {
    this.baseToast.fire({
      icon: 'success',
      title: message,

      background: '#158343e3',
      color: '#fff',
      iconColor: '#fff'
    });
  }

  /** Red Error Toast */
  error(message: string) {
    this.baseToast.fire({
      icon: 'error',
      title: message,

      background: '#E74C3C',
      color: '#fff',
      iconColor: '#fff'
    });
  }

  /** Yellow Warning Toast */
  warning(message: string) {
    this.baseToast.fire({
      icon: 'warning',
      title: message,

      background: '#F1C40F',
      color: '#000',
      iconColor: '#000'
    });
  }

  /** Blue Info Toast */
  info(message: string) {
    this.baseToast.fire({
      icon: 'info',
      title: message,

      background: '#3498DB',
      color: '#fff',
      iconColor: '#fff'
    });
  }
}
