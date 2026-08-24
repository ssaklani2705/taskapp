export class Common {

  getStatusLabel(status: number | string): string {
    switch (+status) {
      case 1:
        return 'Active';
      case 2:
        return 'Inactive';
      case 3:
        return 'Deleted';
      default:
        return 'Unknown';
    }
  }



  getStatusClass(status: number | string): string {
    switch (+status) {
      case 1:
        return 'status-badge active';
      case 2:
        return 'status-badge inactive';
      case 3:
        return 'status-badge deleted';
      default:
        return 'status-badge';
    }
  }

  


  getFollowUpStatusLabel(status: number): string {
    switch (status) {
      case 1: return 'Pending';
      case 2: return 'Closed';
      default: return 'Unknown';
    }
  }

  getFollowUpStatusClass(status: number): string {
    switch (status) {
      case 1: return 'label-warning'; // yellow
      case 2: return 'label-success'; // green
      default: return 'label-default';
    }
  }



  getCustomerStatusLabel(status: number | string): string {
    switch (+status) {
      case 1:
        return 'Gold';
      case 2:
        return 'PI Advance';
      default:
        return 'Unknown';
    }
  }

  getCustomerStatusClass(status: number | string): string {
    switch (+status) {
      case 1:
        return 'label label-sm label-success';
      case 2:
        return 'label label-sm label-warning';
      default:
        return ' ';
    }
  }


  parseEntryDate(dateStr: string): Date {
    const [datePart, timePart, ampm] = dateStr.split(/[\s:]+/); // e.g., ["08-08-2025", "05", "53", "PM"]
    const [day, month, year] = datePart.split('-').map(Number);
    let hour = Number(timePart);
    const minute = Number(dateStr.split(/[\s:]+/)[2]);

    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;

    return new Date(year, month - 1, day, hour, minute);
  }


  validateNumberInput(event: any): void {
    const input = event.target;
    const inputName = input.name;
    let value = input.value;

    const isQuantityField = inputName.startsWith('quantity') || inputName === 'inputQuantity';

    if (isQuantityField) {
      // Remove all non-digit characters (disallow decimals)
      value = value.replace(/\D/g, '');
    } else {
      // Allow only numbers and a single dot
      value = value.replace(/[^0-9.]/g, '');
      const parts = value.split('.');
      if (parts.length > 2) {
        value = parts[0] + '.' + parts[1]; // Only keep the first dot
      }

      // Limit to 2 digits after the decimal
      if (parts.length === 2) {
        parts[1] = parts[1].slice(0, 2);
        value = parts[0] + '.' + parts[1];
      }
    }

    input.value = value;

    // Optional: If model binding needs manual update
    const fieldName = inputName.replace(/[0-9]/g, ''); // e.g., "quantity0" → "quantity"
    if (this.hasOwnProperty(inputName)) {
      (this as any)[inputName] = value;
    }
  }



  allowOnlyNumbers(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;

    const charCode = event.which ? event.which : event.keyCode;

    // Allow: backspace, tab, delete, arrows
    if ([8, 9, 37, 39, 46].includes(charCode)) {
      return;
    }

    const key = event.key;

    // Allow only numbers and decimal
    if (!/[0-9.]/.test(key)) {
      event.preventDefault();
      return;
    }

    // Prevent multiple decimals
    if (key === '.' && input.value.includes('.')) {
      event.preventDefault();
      return;
    }

    // Allow only 2 digits after decimal
    const value = input.value;
    const cursorPosition = input.selectionStart || 0;

    const newValue =
      value.slice(0, cursorPosition) +
      key +
      value.slice(cursorPosition);

    const decimalPart = newValue.split('.')[1];

    if (decimalPart && decimalPart.length > 1) {
      event.preventDefault();
    }
  }


  allowOnlyNumbersWithoutDecimal(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;

    // Allow Backspace, Tab, Left Arrow, Right Arrow
    if ([8, 9, 37, 39].includes(charCode)) {
      return;
    }

    // Block decimal point (.)
    if (charCode === 46) {
      event.preventDefault();
      return;
    }

    // Allow only numbers 0-9
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }


  formatWithDecimals(value: number, decimals: number): string | number {
    if (decimals === 0) {
      return Math.trunc(value); // removes decimal part
    }

    return value.toFixed(decimals);
  }

}
