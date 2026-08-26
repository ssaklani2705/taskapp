import { Injectable } from '@angular/core';
import { SESSION_KEYS } from './session-storage.keys';

@Injectable({
    providedIn: 'root'
})
export class SessionStorageService {

    constructor() {}


    // =========================================================
    // SAVE DATA
    // =========================================================

    setItem(key: string, value: any): void {

        sessionStorage.setItem(
            key,
            JSON.stringify(value)
        );

    }


    // =========================================================
    // GET DATA
    // =========================================================

    getItem(key: string): any {

        const data =
            sessionStorage.getItem(key);

        if (!data) {
            return null;
        }

        try {

            return JSON.parse(data);

        } catch (error) {

            console.error(
                'Invalid session storage data:',
                key,
                error
            );

            sessionStorage.removeItem(key);

            return null;
        }

    }


    // =========================================================
    // REMOVE SINGLE ITEM
    // =========================================================

    removeItem(key: string): void {

        sessionStorage.removeItem(key);

    }


    // =========================================================
    // CLEAR ALL FILTERS
    // =========================================================

    clearAllFilters(): void {

        Object.values(SESSION_KEYS).forEach(
            (key) => {

                sessionStorage.removeItem(key);

            }
        );

    }


    // =========================================================
    // CLEAR ALL FILTERS EXCEPT CURRENT
    // =========================================================

    clearOtherFilters(currentKey: string): void {

        Object.values(SESSION_KEYS).forEach(
            (key) => {

                if (key !== currentKey) {

                    sessionStorage.removeItem(key);

                }

            }
        );

    }


    // =========================================================
    // CLEAR OTHER SESSIONS EXCEPT CURRENT
    // =========================================================

    clearOtherSessions(exceptKey: string): void {

        Object.values(SESSION_KEYS).forEach(
            (key) => {

                if (key !== exceptKey) {

                    sessionStorage.removeItem(key);

                }

            }
        );

    }

}