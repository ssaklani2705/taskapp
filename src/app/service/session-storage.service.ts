import { Injectable } from '@angular/core';
import { SESSION_KEYS } from './session-storage.keys';
@Injectable({
    providedIn: 'root'
})
export class SessionStorageService {
    constructor() { }
    // SAVE DATA
    setItem(key: string, value: any): void {
        sessionStorage.setItem(
            key,
            JSON.stringify(value)
        );
    }
    // GET DATA
    getItem(key: string): any {
        const data = sessionStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }
    // REMOVE SINGLE ITEM
    removeItem(key: string): void {
        sessionStorage.removeItem(key);
    }
    // CLEAR ALL FILTERS
    clearAllFilters(): void {
        const filterKeys = [
            SESSION_KEYS.PRODUCT_MASTER_FILTER,
            SESSION_KEYS.DISPATCH_MASTER_FILTER,
            SESSION_KEYS.QUOTATION_MASTER_FILTER,
            SESSION_KEYS.CLIENT_MASTER_FILTER,
            SESSION_KEYS.STATE_MASTER_FILTER,
            SESSION_KEYS.UNIT_MASTER_FILTER,
            SESSION_KEYS.VENDOR_MASTER_FILTER,
            SESSION_KEYS.PURCHASE_MASTER_FILTER
        ];
        filterKeys.forEach(key => {
            sessionStorage.removeItem(key);
        });
    }
    
    // CLEAR ALL FILTERS EXCEPT CURRENT
    clearOtherFilters(currentKey: string): void {
        const filterKeys = [
            SESSION_KEYS.PRODUCT_MASTER_FILTER,
            SESSION_KEYS.DISPATCH_MASTER_FILTER,
            SESSION_KEYS.QUOTATION_MASTER_FILTER,
            SESSION_KEYS.CLIENT_MASTER_FILTER,
            SESSION_KEYS.STATE_MASTER_FILTER,
            SESSION_KEYS.UNIT_MASTER_FILTER,
            SESSION_KEYS.VENDOR_MASTER_FILTER,
            SESSION_KEYS.PURCHASE_MASTER_FILTER
        ];
        filterKeys.forEach(key => {
            if (key !== currentKey) {
                sessionStorage.removeItem(key);
            }
        });
    }

     clearOtherSessions(exceptKey: string): void {
        Object.values(SESSION_KEYS).forEach((key) => {
            if (key !== exceptKey) {
                sessionStorage.removeItem(key);
            }
        });
    }
}