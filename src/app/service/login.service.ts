import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
// import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';


export interface RefreshResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;      // required if data exists
    username?: string;  // optional
  } | null;
}


  @Injectable({ providedIn: 'root' })
  export class LoginService {
    constructor(private http: HttpClient) {}



// Refresh token
freshToken(): Observable<RefreshResponse> {
  const token = sessionStorage.getItem('authToken');
  // console.log(' Current token:', token);

  if (!token) {
    // console.warn(' No token found for refresh');
    return of({ success: false, message: 'No token', data: null } as RefreshResponse);
  }

  return this.http.post<RefreshResponse>(
    `${environment.apiBaseUrl}auth/refreshtoken`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
      // withCredentials: true
    }
  ).pipe(
    tap(res => {
      // console.log('Refresh response:', res);
      if (res?.data?.token) {
        // console.log(' New token:', res.data.token);
        sessionStorage.setItem('authToken', res.data.token);
      }
    }),
    catchError(err => {
    // console.error(' Error during freshToken():', err);
    return of({ success: false, message: 'Refresh failed', data: null } as RefreshResponse);
  })
  );
}


  checkLogin(data: any) {
  return this.http.post<{ success: boolean; message: string; data: any }>(
    `${environment.apiBaseUrl}auth/login`,
    data,
    { withCredentials: true }   // important for session handling
  );
}


  getCaptcha(): Observable<{ success: boolean; message: string; data: string }> {
    return this.http.get<{ success: boolean; message: string; data: string }>(
      `${environment.apiBaseUrl}auth/captcha`,
          { withCredentials: true }   // MUST ADD THIS

    );
  }

  getUserById(userId: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}api/${userId}`);
  }

    // Get paginated user list
  loadUsers(page: number, size: number, statusIndex: number, search: string): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('statusIndex', statusIndex.toString())
      .set('search', search || '');

    return this.http.get<any>(`${environment.apiBaseUrl}api/getUserDetails`, { params });
  }


    getUserDetails(page: any, size: any, statusIndex: any, search: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}api/getUserDetails?page=${page}&size=${size}&statusIndex=${statusIndex}&search=${search}`);
  }

   forgotPassword(emailId: string, userId: string,password: string) {
    return this.http.post<any>(
      `${environment.apiBaseUrl}auth/forgotpassword?emailId=${emailId}&userId=${userId}&password=${password}`,
      {} // sending empty body because your backend takes only @RequestParam
    );
  }

  forgotPasswordMail(emailId: string) {
  return this.http.post<any>(
    `${environment.apiBaseUrl}auth/forgotpasswordMail?emailId=${encodeURIComponent(emailId)}`,
    {} // empty body because backend uses @RequestParam only
  );
}


//knowledgeSharing

getKnowledgeSharingDetails(page: any, size: any, statusIndex: any, search: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}knowledgeSharing/getKnowledgeSharingDetails?page=${page}&size=${size}&statusIndex=${statusIndex}&search=${search}`);
    }

    addKnowledgeSharing(formData: FormData) {
  return this.http.post(`${environment.apiBaseUrl}knowledgeSharing/addKnowledgeSharing`, formData, {
    responseType: 'text' as 'json' // Angular expects type narrowing here
  });
}


logout() {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      return null;
    }

     const sessionId = sessionStorage.getItem('sessionId');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const body = { sessionId };

    return this.http.post(`${environment.apiBaseUrl}auth/logout`, body, { headers });
    // return this.http.post(`${environment.apiBaseUrl}auth/logout`, {}, { headers });
  }

    clearSession() {
    sessionStorage.removeItem('authToken');
  }

}
