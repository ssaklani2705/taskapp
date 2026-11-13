import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
// import { ApiResponse } from '../classes/ApiResponse';
import { ResponseApi } from '../classes/response-api.model';
import { Service } from '../features/service/add-service/add-service';

export interface Feedback {
  clientId: number;
  remarks: string;
  userId: number;
  date: string; // formatted as 'dd-MM-yyyy HH:mm'
}

export interface UserActiveDTO {
  userId: number;
  firstName: string;
}

export interface StateDTO {
  stateId: number;
  stateName: string;
  stateCode: number;
}

export interface CountryDTO {
  countryId: number;
  name: string;
  code1: number;
  code2: number;
}

interface ApiResponseQuotation<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface DepartmentDTO {
  departmentId: number;
  name?: string;
  sequence?: number;
  status?: number;
  userId?: number;
  regdate?: string;
  moddate?: string;
}

export interface DesignationDTO {
  desigmationId?: number;
  name?: string;
}

export interface TaskCategoryDTO {
  taskcategoryId: number;
  name: string;
}

// ---- Company Shift ----

export interface CompanyShift {
  shiftId?: number;
  shiftName: string;
  fromTime: string; // "HH:mm"
  toTime: string; // "HH:mm"
  status?: number;
  companyId: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class DataProviderService {
  constructor(private http: HttpClient) {}

  checkClientAssignment(managerId: number): Observable<{ assigned: boolean; message: string }> {
    return this.http.get<{ assigned: boolean; message: string }>(`${environment.apiBaseUrl}admin/dashboard/client/check-assignment/${managerId}`);
  }

  getUserManagementDetails(
    page: any,
    size: any,
    statusIndex: any,
    search: any,
    departmentId: number | null,
    designationId: number | null,
    selectedCategoryId: any,
    weeklyOff: any,
    companyId: any,
    shiftId: any,
  ): Observable<any> {
    return this.http.get(
      `${environment.apiBaseUrl}admin/getUserManagementDetails` +
        `?page=${page}` +
        `&size=${size}` +
        `&statusIndex=${statusIndex}` +
        `&search=${encodeURIComponent(search || '')}` +
        `&departmentId=${departmentId ?? '0'}` +
        `&designationId=${designationId ?? '0'}` +
        `&weeklyOff=${weeklyOff ?? '0'}` +
        `&selectedCategoryId=${selectedCategoryId ?? '0'}` +
        `&companyId=${companyId ?? '0'}` +
        `&shiftId=${shiftId ?? '0'}`,
    );
  }

  getUserManagementDetailsById(id: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/getUserManagementDetails/${id}`);
  }

  saveUserManagementDetailsDetail(userRequest: any) {
    return this.http.post<ResponseApi>(`${environment.apiBaseUrl}admin/saveUserDetail`, userRequest, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  deleteUserManagement(id: number, createdBy: string): Observable<any> {
    const params = { userId: id, createdBy: createdBy };
    return this.http.post(`${environment.apiBaseUrl}admin/deleteUser`, null, { params });
  }

  getActiveUsers(): Observable<UserActiveDTO[]> {
    return this.http.get<UserActiveDTO[]>(`${environment.apiBaseUrl}admin/active`);
  }

  getActiveStates(): Observable<StateDTO[]> {
    return this.http.get<StateDTO[]>(`${environment.apiBaseUrl}admin/state/active`);
  }

  getCity(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/getCity`);
  }

  getActiveClient(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/getActiveClient`);
  }

  //Reports mail
  getMailLogDetails(page: any, size: any, search: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}mailLog/getMailLogDetails?page=${page}&size=${size}&search=${search}`);
  }

  // data-provider.service.ts
  getMailLogHtml(mailLogId: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}mailLog/getMailLogHtml?mailLogId=${mailLogId}`);
  }

  getUserAccessDetails(page: any, size: any, search: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}useraccesslog/getUserAccessDetails?page=${page}&size=${size}&search=${search}`);
  }

  deleteUser(id: number, createdBy: string): Observable<any> {
    const params = { userId: id, createdBy: createdBy };
    return this.http.post(`${environment.apiBaseUrl}api/deleteUser`, null, { params });
  }

  saveUserDetail(userRequest: any) {
    return this.http.post<ResponseApi>(`${environment.apiBaseUrl}api/saveUserDetail`, userRequest, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  getStats(fromDate?: string, toDate?: string): Observable<any> {
    let url = `${environment.apiBaseUrl}quotation/stats?`;

    if (fromDate) {
      url += `&startDate=${encodeURIComponent(fromDate)}`;
    }

    if (toDate) {
      url += `&endDate=${encodeURIComponent(toDate)}`;
    }

    return this.http.get(url);
  }

  getAllClient(search: string, userId: number, isAdmin: string): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/getAllClient?search=${search}&userId=${userId}&isAdmin=${isAdmin}`);
  }

  getDepartmentDetails(page: number, size: number, statusIndex: number, search: string): Observable<any> {
    const params = {
      page: page.toString(),
      size: size.toString(),
      statusIndex: statusIndex.toString(),
      search: search || '',
    };

    return this.http.get(`${environment.apiBaseUrl}admin/department/getDepartmentDetails`, {
      params,
    });
  }

  saveDepartment(department: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}admin/department/saveDepartment`, department);
  }

  getDepartmentById(departmentId: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/department/${departmentId}`);
  }

  deleteDepartment(department: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}admin/department/deleteDepartment`, department);
  }

  getDesigmationDetails(page: any, size: any, statusIndex: any, search: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/designation/getDesignationDetails?page=${page}&size=${size}&statusIndex=${statusIndex}&search=${search}`);
  }

  getDesigmationById(designationId: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/designation/${designationId}`);
  }

  saveDesigmation(desigmation: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}admin/designation/saveDesignation`, desigmation);
  }

  deleteDesigmation(desigmation: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}admin/designation/deleteDesignation`, desigmation);
  }

  getActiveDesigmations(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/designation/active`);
  }

  getCategoriesByDepartmentId(departmentId: any): Observable<TaskCategoryDTO[]> {
    return this.http.get<TaskCategoryDTO[]>(`${environment.apiBaseUrl}admin/taskcategory/department/${departmentId}`);
  }

  getCategoriesByDepartmentIds(departmentIds: number[]): Observable<TaskCategoryDTO[]> {
    return this.http.get<TaskCategoryDTO[]>(`${environment.apiBaseUrl}admin/taskcategory/departments`, { params: { departmentIds: departmentIds.join(',') } });
  }

  //Task Category
  getTaskCategoryDetails(page: any, size: any, statusIndex: any, search: any, departmentId: any, serviceId: any): Observable<any> {
    return this.http.get(
      `${environment.apiBaseUrl}admin/taskcategory/getTaskCategoryDetails` +
        `?page=${page}` +
        `&size=${size}` +
        `&statusIndex=${statusIndex}` +
        `&search=${encodeURIComponent(search || '')}` +
        `&departmentId=${departmentId || 0}` +
        `&serviceId=${serviceId || 0}`,
    );
  }

  getTaskCategoryById(taskcategoryId: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/taskcategory/${taskcategoryId}`);
  }
  saveTaskCategory(taskCategory: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}admin/taskcategory/saveTaskCategory`, taskCategory);
  }
  deleteTaskCategory(taskCategory: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}admin/taskcategory/deleteTaskCategory`, taskCategory);
  }
  getActiveTaskCategories(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/taskcategory/active`);
  }

  getActiveDepartments(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/department/active`);
  }



  getClientDetails(
    page: any,
    size: any,
    status: any,
    managerId: any,
    stateId: any,
    gstFlag: any,
    taxFlag: any,
    planId: any,
    fromDate: any,
    toDate: any,
    clientName: any,
    clientCode: any,
    contactName: any,
    contactEmail: any,
    search: any,
    sortColumn: string,
    sortDirection: string,
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('status', status.toString())
      .set('managerId', managerId.toString())
      .set('stateId', stateId.toString())
      .set('planId', planId?.toString())
      .set('sortColumn', sortColumn)
      .set('sortDirection', sortDirection);
    if (clientName && clientName.trim() !== '') {
      params = params.set('clientName', clientName.trim());
    }
    if (clientCode && clientCode.trim() !== '') {
      params = params.set('clientCode', clientCode.trim());
    }
    if (contactName && contactName.trim() !== '') {
      params = params.set('contactName', contactName.trim());
    }
    if (contactEmail && contactEmail.trim() !== '') {
      params = params.set('contactEmail', contactEmail.trim());
    }
    if (search && search.trim() !== '') {
      params = params.set('search', search.trim());
    }

    if (gstFlag !== null && gstFlag !== undefined) {
      params = params.set('gstFlag', gstFlag.toString());
    }

    if (taxFlag !== null && taxFlag !== undefined) {
      params = params.set('taxFlag', taxFlag.toString());
    }

    if (fromDate && fromDate.trim() !== '') {
      params = params.set('fromDate', fromDate.trim());
    }

    if (toDate && toDate.trim() !== '') {
      params = params.set('toDate', toDate.trim());
    }
    return this.http.get<any>(`${environment.apiBaseUrl}admin/getClientDetails`, { params });
  }

  saveClient(client: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}admin/addOrUpdateClient`, client);
  }

  getClientByClientId(clientId: number) {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/getClient/${clientId}`);
  }

  getStates(): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/state/getStates`);
  }

  getManagers(): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/active`);
  }

  getClientDetailsByClientId(clientId: number) {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/clientDetails/${clientId}`);
  }

  deleteClient(clientId: number, userId: number): Observable<any> {
    const params = new HttpParams().set('clientId', clientId.toString()).set('userId', userId.toString());

    return this.http.post(`${environment.apiBaseUrl}admin/deleteClient`, null, { params });
  }

  uploadClientsExcel(file: File, userId: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId.toString());
    return this.http.post<any>(`${environment.apiBaseUrl}/admin/uploadClientsExcel`, formData);
  }

  saveState(state: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.apiBaseUrl}admin/state/addOrUpdate`, state);
  }

  getStateList(page: any, size: any, statusIndex: any, search: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/state/getStateList?page=${page}&size=${size}&statusIndex=${statusIndex}&search=${search}`);
  }

  getStateById(stateId: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/state/getById/${stateId}`);
  }

  // Delete State
  deleteState(state: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}admin/state/delete`, state);
  }

  savePlan(plan: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.apiBaseUrl}admin/plan/add_or_Update`, plan);
  }

  getPlanList(page: any, size: any, statusIndex: any, search: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/plan/plan_list?page=${page}&size=${size}&statusIndex=${statusIndex}&search=${search}`);
  }

  getPlanById(planId: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/plan/get_by_Id/${planId}`);
  }

  // Delete State
  deletePlan(plan: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}admin/plan/delete`, plan);
  }
  //sunil
  getTaskFilterData(isAdmin: string, userId: number, loginType: string, isHod: any): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/task/getTaskFilterData`, {
      params: {
        isAdmin: isAdmin.toString(),
        userId: userId.toString(),
        loginType: loginType.toString(),
        isHod: isHod.toString(),
      },
    });
  }

  getTaskFilterDataForIndex(isAdmin: string, userId: number, loginType: string, isHod: any): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/task/getTaskFilterDataForIndex`, {
      params: {
        isAdmin: isAdmin.toString(),
        userId: userId.toString(),
        loginType: loginType.toString(),
        isHod: isHod.toString(),
        // clientId: clientId ?? ''
      },
    });
  }

  changesClientIdgetTaskFilterData(isAdmin: string, userId: number, loginType: string, clientId: number, isHod: string, userType?: number | null): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/task/getTaskFilterDataOnChange`, {
      params: {
        isAdmin: isAdmin.toString(),
        userId: userId.toString(),
        loginType: loginType.toString(),
        clientId: clientId ?? '',
        isHod: isHod.toString(),
        ...(userType != null ? { userType: userType.toString() } : {}),
      },
    });
  }

  changesCategoryIdgetUserFilterData(
    isAdmin: string,
    userId: number,
    loginType: string,
    clientId: number,
    categoryId: number,
    systemFlag: number,
    startDate: string | null,
    endDate: string | null,
    userType?: number,
  ): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/task/changesCategoryIdgetUserFilterData`, {
      params: {
        isAdmin: isAdmin.toString(),
        userId: userId.toString(),
        loginType: loginType.toString(),
        clientId: clientId ?? '',
        categoryId: categoryId ?? '',
        systemFlag: (systemFlag ?? 0).toString(),
        startDate: startDate?.toString() || '',
        endDate: endDate?.toString() || '',
        userType: userType ?? '',
      },
    });
  }

  getTaskDetails(
    page: number,
    size: number,
    statusIndex: number,
    search: string,
    clientId: number,
    taskCategoryId: number,
    assignedTo: number,
    priority: number,
    fromDate: string,
    toDate: string,
    isAdmin: string,
    userId: any,
    taskStatusIds: string[],
    loginType: string,
    dashboardFilter: string,
    isHod: any,
    taskId: number = 0,
    assignedToMe: number = 0, assignedByMe: number = 0
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('statusIndex', statusIndex.toString())
      .set('search', search || '')
      .set('clientId', (clientId || 0).toString())
      .set('taskCategoryId', (taskCategoryId || 0).toString())
      .set('assignedTo', (assignedTo || 0).toString())
      .set('priority', (priority || 0).toString())
      .set('fromDate', fromDate || '')
      .set('toDate', toDate || '')
      .set('isAdmin', isAdmin || '')
      .set('userId', userId ? userId.toString() : '0')
      .set('loginType', loginType || '')
      .set('dashboardFilter', dashboardFilter || '')
      .set('isHod', isHod || '')
      .set('taskId', String(taskId))
     .set('assignedToMe', assignedToMe)
    .set('assignedByMe', assignedByMe);

    if (taskStatusIds && taskStatusIds.length > 0) {
      params = params.set('taskStatusIds', taskStatusIds.join(','));
    }

    console.log('Task API Params:', params.toString());

    return this.http.get<any>(`${environment.apiBaseUrl}admin/task/getTaskDetails`, { params });
  }

  saveTask(formData: FormData) {
    return this.http.post<any>(`${environment.apiBaseUrl}admin/task/saveTask`, formData);
  }

  getTaskById(taskId: number) {
    return this.http.get(`${environment.apiBaseUrl}admin/task/getTaskDetailsById?taskId=${taskId}`);
  }

  changeClientManager(clientId: number, managerId: number, userId: number) {
    return this.http.put<any>(`${environment.apiBaseUrl}admin/client/${clientId}/manager`, {
      managerId: managerId,
      userId: userId,
    });
  }

  deleteTask(task: any) {
    const params = {
      taskId: task.taskId,
      createdBy: task.createdBy,
    };

    return this.http.post<any>(`${environment.apiBaseUrl}admin/task/deleteTask`, null, { params });
  }

  getPlan(): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/plan/getPlan`);
  }

  addTaskNote(request: any): Observable<any> {
    return this.http.post<any>(`${environment.apiBaseUrl}admin/taskNote/add`, request);
  }

  getTaskNotes(taskId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/taskNote/getByTaskId/${taskId}`);
  }

  updateTaskDetails(formData: FormData): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}admin/task/update_task_status`, formData);
  }

  getRecurringClients(userId: number, isAdmin: string, loginType: string, isHod: any) {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/getRecurringClients`, {
      params: {
        userId: userId,
        isAdmin: isAdmin,
        loginType: loginType,
        isHod: isHod,
      },
    });
  }

  getRecurringClientsForIndex(userId: number, isAdmin: string, loginType: string) {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/getRecurringClientsForIndex`, {
      params: {
        userId: userId,
        isAdmin: isAdmin,
        loginType: loginType,
      },
    });
  }

  addOrUpdateRecurring(data: any, userId: number) {
    return this.http.post<any>(`${environment.apiBaseUrl}admin/addOrUpdateRecurring`, data, {
      params: {
        userId: userId,
      },
    });
  }

  getRecurringById(recurringId: number, userId: number) {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/getRecurringById/${recurringId}`, {
      params: {
        userId: userId,
      },
    });
  }

  getRecurringDetails(
    page: number,
    size: number,
    status: number = 0,
    search: string = '',
    clientId: number = 0,
    type: number = 0,
    taskCatId: number = 0,
    priority: number = 0,
    sortColumn: string = 'title',
    sortDirection: string = 'asc',
    userId: number,
    isAdmin: string,
    loginType: string,
  ) {
    const params: any = {
      page: page,
      size: size,
      status: status,
      clientId: clientId,
      type: type,
      taskCatId: taskCatId,
      priority: priority,
      sortColumn: sortColumn,
      sortDirection: sortDirection,
      userId: userId,
      isAdmin: isAdmin,
      loginType: loginType,
    };

    if (search && search.trim() !== '') {
      params.search = search.trim();
    }

    return this.http.get<any>(`${environment.apiBaseUrl}admin/getRecurringDetails`, { params });
  }

  deleteRecurring(recurringId: number, userId: number) {
    return this.http.post<any>(`${environment.apiBaseUrl}admin/deleteRecurring`, null, {
      params: {
        recurringId: recurringId,
        userId: userId,
      },
    });
  }

  getTaskCategories() {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/taskcategory/active`);
  }

  getActiveTaskCategoriesForRecurring(userId: any, isAdmin: any, loginType: any, isHod: any, clientId: any) {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/taskcategory/recurring/active`, {
      params: {
        userId: userId,
        isAdmin: isAdmin,
        loginType: loginType,
        isHod: isHod,
        clientId: clientId,
      },
    });
  }

  getActiveTaskCategoriesForGeneric(userId: any, isAdmin: any, loginType: any, isHod: any) {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/taskcategory/generic/active`, {
      params: {
        userId: userId,
        isAdmin: isAdmin,
        loginType: loginType,
        isHod: isHod,
      },
    });
  }

  getActiveTaskCategoriesForRecurringForIndex(userId: any, isAdmin: any, loginType: any) {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/taskcategory/recurringForindex/active`, {
      params: {
        userId: userId,
        isAdmin: isAdmin,
        loginType: loginType,
      },
    });
  }

  getRecurringDetailsById(recurringId: number, userId: number) {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/recurringDetails/${recurringId}`, {
      params: {
        userId: userId,
      },
    });
  }

  updateClientOutstanding(clientId: number, outstanding: number, managerId: number, userId: number) {
    return this.http.post<any>(
      `${environment.apiBaseUrl}admin/updateClientOutstanding`,
      {
        clientId: clientId,
        outstanding: outstanding,
        userId: userId,
      },
      {
        params: {
          managerId: managerId,
        },
      },
    );
  }
  //Employee Dashboard
  getDashboard(userId: number, isAdmin: any, selectedClientId: any, isHod: any): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/dashboard/dashboard?userId=${userId}&isAdmin=${isAdmin}&selectedClientId=${selectedClientId}&isHod=${isHod}`);
  }

  //New
  getTasksByStatus(page: number, size: number, clientId: number, userId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/dashboard/getTasksByStatus`, {
      params: {
        page,
        size,
        clientId,
        userId,
      },
    });
  }

  countOfActiveTask(clientId: any, userId: any): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/dashboard/countOfActiveTask`, {
      params: {
        clientId: clientId,
        userId: userId,
      },
    });
  }

  countOfCompletedTask(clientId: any, userId: any): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/dashboard/countOfCompletedTask`, {
      params: {
        clientId: clientId,
        userId: userId,
      },
    });
  }

  countOfPendingTask(clientId: any, userId: any): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/dashboard/countOfPendingTask`, {
      params: {
        clientId: clientId,
        userId: userId,
      },
    });
  }

  countOfAssignedTask(clientId: any, userId: any): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/dashboard/countOfAssignedTask`, {
      params: {
        clientId: clientId,
        userId: userId,
      },
    });
  }

  countOfAssigneeClosureTask(clientId: any, userId: any): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/dashboard/countOfAssigneeClosureTask`, {
      params: {
        clientId: clientId,
        userId: userId,
      },
    });
  }

  countOfReOpenTask(clientId: any, userId: any): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/dashboard/countOfReOpenTask`, {
      params: {
        clientId: clientId,
        userId: userId,
      },
    });
  }

  countOfAssigneeReClosureTask(clientId: any, userId: any): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/dashboard/countOfAssigneeReClosureTask`, {
      params: {
        clientId: clientId,
        userId: userId,
      },
    });
  }

  countOfUnAssigneeTask(clientId: any, userId: any): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/dashboard/countOfUnAssigneeTask`, {
      params: {
        clientId: clientId,
        userId: userId,
      },
    });
  }

  getTaskClient(userId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/dashboard/getTaskClient`, {
      params: {
        userId,
      },
    });
  }

  // Dashboard Clients
  getDashboardClients(userId: any, isAdmin: string, loginType: string, selectedClientId: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/dashboard/dashboard-clients?userId=${userId}&isAdmin=${isAdmin}&loginType=${loginType}&selectedClientId=${selectedClientId}`);
  }

  updateTaskAssignedUser(taskId: any, assignedTo: any, userId: any, remarks: string, date: string | null, endDate: string | null, buddyId: number | null = null): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}admin/task/updateAssignedUser`, {
      taskId: taskId,
      assignedTo: assignedTo,
      userId: userId,
      remarks: remarks,
      date: date,
      endDate: endDate,
      buddyId: buddyId,
    });
  }

  // ============================================================
  // HOLIDAY
  // ============================================================

  uploadHolidayExcel(file: File, userId: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId.toString());
    return this.http.post<any>(`${environment.apiBaseUrl}admin/holiday/uploadHolidayExcel`, formData);
  }

  deleteHoliday(holiday: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}admin/holiday/deleteHoliday`, holiday);
  }

  saveHoliday(holiday: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}admin/holiday/saveHoliday`, holiday);
  }

  private formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  getHolidayDetails(page: number, size: number, statusIndex: number, search: string, fromDate?: Date | null, toDate?: Date | null): Observable<any> {
    const params: { [key: string]: string } = {
      page: page.toString(),
      size: size.toString(),
      statusIndex: statusIndex.toString(),
      search: search || '',
    };
    if (fromDate) {
      params['fromDate'] = this.formatDateForApi(fromDate);
    }
    if (toDate) {
      params['toDate'] = this.formatDateForApi(toDate);
    }
    return this.http.get(`${environment.apiBaseUrl}admin/holiday/getHolidayDetails`, {
      params,
    });
  }

  getHolidayById(holidayId: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/holiday/${holidayId}`);
  }

  getActiveHolidays(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/holiday/active`);
  }

  downloadFile(type: string, fileName: string): Observable<Blob> {
    return this.http.get(`${environment.apiBaseUrl}file/download`, {
      params: { type, fileName },
      responseType: 'blob', // binary-safe, prevents corrupted Word/Excel files
    });
  }

  // getAssigneeWorkload(taskCatId: number, startDate: string | null, endDate: string | null): Observable<any> {
  //   return this.http.get(`${environment.apiBaseUrl}admin/task/assignee_workload`, {
  //     params: {
  //       taskCatId: taskCatId.toString(),
  //       startDate: startDate || '',
  //       endDate: endDate || '',

  //     },
  //   });
  // }

  getAssigneeWorkload(taskCatId: number, startDate: string | null, endDate: string | null, excludeUserId?: number): Observable<any> {
    const params: { [key: string]: string } = {
      taskCatId: taskCatId.toString(),
      startDate: startDate || '',
      endDate: endDate || '',
    };

    // only sent when re-assigning (the task's current assignee is excluded from the recommendation)
    if (excludeUserId && excludeUserId > 0) {
      params['excludeUserId'] = excludeUserId.toString();
    }

    return this.http.get(`${environment.apiBaseUrl}admin/task/assignee_workload`, { params });
  }

  isEmployeeAvailableForTaskCategory(taskCategoryId: number) {
    return this.http.get<boolean>(`${environment.apiBaseUrl}admin/taskcategory/recurring/category/employee-available`, {
      params: {
        taskCategoryId: taskCategoryId.toString(),
      },
    });
  }

  isEmployeeAvailableForTaskCategoryForTask(taskCategoryId: number) {
    return this.http.get<boolean>(`${environment.apiBaseUrl}admin/taskcategory/task/category/employee-available`, {
      params: {
        taskCategoryId: taskCategoryId.toString(),
      },
    });
  }

  updatePassword(request: any) {
    return this.http.post<any>(`${environment.apiBaseUrl}auth/change_password`, request);
  }

  //    getWorkload(
  //   from: string,
  //   to: string,
  //   departmentIds: number[] = [],
  //   categoryIds: number[] = [],
  // ) {
  //   const params: { [key: string]: string } = { from, to };

  //   // Send a filter only when something is selected (empty = All)
  //   if (departmentIds.length) params['departmentIds'] = departmentIds.join(',');
  //   if (categoryIds.length) params['categoryIds'] = categoryIds.join(',');

  //   return this.http.get<{ success: boolean; message: string; data: any[] }>(
  //     `${environment.apiBaseUrl}admin/report/workload`,
  //     { params },
  //   );
  // }

  getWorkload(from: string, to: string, departmentIds: number[] = [], categoryIds: number[] = []) {
    const params: { [key: string]: string } = { from, to };

    // Send a filter only when something is selected (empty = All)
    if (departmentIds.length) params['departmentIds'] = departmentIds.join(',');
    if (categoryIds.length) params['categoryIds'] = categoryIds.join(',');

    return this.http.get<{ success: boolean; message: string; data: any[] }>(`${environment.apiBaseUrl}admin/report/workload`, { params });
  }

  saveCompany(payload: any) {
    return this.http.post(`${environment.apiBaseUrl}admin/company/add_or_update`, payload);
  }

  getCompanyById(companyId: number) {
    return this.http.get(`${environment.apiBaseUrl}admin/company/find_by_id/${companyId}`);
  }

  getCompanyList(page: number, size: number, statusIndex: number, search: string, stateId: any, companySiteOffice: number = 0, workingDays: string = '') {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('statusIndex', statusIndex.toString())
      .set('search', search)
      .set('stateId', stateId.toString())
      .set('companySiteOffice', companySiteOffice.toString())
      .set('workingDays', workingDays);

    return this.http.get(`${environment.apiBaseUrl}admin/company/company_list`, { params });
  }

  deleteCompany(companyId: number, userId: number) {
    return this.http.post(`${environment.apiBaseUrl}admin/company/delete_company`, { companyId, userId });
  }

  getServiceList(page: number, size: number, statusIndex: number, search: string) {
    const params = new HttpParams().set('page', page).set('size', size).set('statusIndex', statusIndex).set('search', search);

    return this.http.get(`${environment.apiBaseUrl}admin/service/list`, { params });
  }

  deleteService(payload: { serviceId: number; userId: number | null }) {
    return this.http.post(`${environment.apiBaseUrl}admin/service/delete`, payload);
  }

  // Get Service By ID
  getServiceById(serviceId: number): Observable<ApiResponse<Service>> {
    return this.http.get<ApiResponse<Service>>(`${environment.apiBaseUrl}admin/service/get_by_Id/${serviceId}`);
  }

  // getActiveServices(): Observable<ApiResponse<Service>> {
  //     return this.http.get<ApiResponse<Service>>(`${environment.apiBaseUrl}admin/service/active`);
  //   }

  getActiveServices(): Observable<ApiResponse<Service[]>> {
    return this.http.get<ApiResponse<Service[]>>(`${environment.apiBaseUrl}admin/service/active`);
  }

  // // Add or Update Service
  saveService(payload: Service): Observable<ApiResponse<Service>> {
    return this.http.post<ApiResponse<Service>>(`${environment.apiBaseUrl}admin/service/add_or_Update`, payload);
  }

  // ============================================================
  // Generic Recurring
  // ============================================================
  // For AddOrUpdate
  addOrUpdateGenericRecurring(data: any, userId: number) {
    return this.http.post<any>(`${environment.apiBaseUrl}admin/addOrUpdateGenericRecurring`, data, {
      params: {
        userId: userId,
      },
    });
  }
  // For Edit
  getGenericRecurringById(genericRecurringId: number, userId: number) {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/getGenericRecurringById/${genericRecurringId}`, {
      params: {
        userId: userId,
      },
    });
  }
  // For Index
  getGenericRecurringDetails(
    page: number,
    size: number,
    status: number = 0,
    search: string = '',
    type: number = 0,
    taskCatId: number = 0,
    forValue: number = 0,
    priority: number = 0,
    sortColumn: string = 'title',
    sortDirection: string = 'asc',
    userId: number,
    isAdmin: string,
    loginType: string,
  ) {
    const params: any = {
      page: page,
      size: size,
      status: status,
      type: type,
      taskCatId: taskCatId,
      forValue,
      priority: priority,
      sortColumn: sortColumn,
      sortDirection: sortDirection,
      userId: userId,
      isAdmin: isAdmin,
      loginType: loginType,
    };
    if (search && search.trim() !== '') {
      params.search = search.trim();
    }
    return this.http.get<any>(`${environment.apiBaseUrl}admin/getGenericRecurringDetails`, { params });
  }
  // For View
  getViewGenericRecurringById(genericRecurringId: number, userId: number) {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/genricRecurringDetails/${genericRecurringId}`, {
      params: {
        userId: userId,
      },
    });
  }
  // For Delete
  deleteGenericRecurring(genericRecurringId: number, userId: number) {
    return this.http.post<any>(`${environment.apiBaseUrl}admin/deleteGenericRecurring`, null, {
      params: {
        genericRecurringId: genericRecurringId,
        userId: userId,
      },
    });
  }

  // getTaskCategoriesUsedInGenericRecurring() {
  //   return this.http.get<any[]>(`${environment.apiBaseUrl}admin/generic-recurring/task-categories`);
  // }

  getTaskCategoriesUsedInGenericRecurring(userId: number, loginType: string, isAdmin: string, isHod: string) {
    return this.http.get<any[]>(`${environment.apiBaseUrl}admin/generic-recurring/task-categories`, {
      params: {
        userId: userId.toString(),
        loginType: loginType,
        isAdmin: isAdmin,
        isHod: isHod,
      },
    });
  }

  getTaskRatingSummary(fromDate?: string | null, toDate?: string | null, username?: string | null, departmentIds: number[] = [], page: number = 0, size: number = 10): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }
    if (toDate) {
      params = params.set('toDate', toDate);
    }
    if (username?.trim()) {
      params = params.set('username', username.trim());
    }
    departmentIds.forEach((id) => {
      params = params.append('departmentIds', id.toString());
    });
    return this.http.get<any>(`${environment.apiBaseUrl}admin/task/rating-summary`, { params });
  }
  getRatingReportDepartments(username?: string | null): Observable<any[]> {
    let params = new HttpParams();
    if (username?.trim()) {
      params = params.set('username', username.trim());
    }
    return this.http.get<any[]>(`${environment.apiBaseUrl}admin/task/rating-summary/departments`, { params });
  }

  getTaskReassignReport(
    page: number,
    size: number,
    search: string,
    fromDate: string,
    toDate: string,
    taskCategoryId: number,
    clientId: number,
    userId: number,
    departmentIds: string,
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('search', search ?? '')
      .set('taskCategoryId', taskCategoryId)
      .set('clientId', clientId)
      .set('userId', userId)
      .set('departmentIds', departmentIds);

    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);

    return this.http.get<any>(`${environment.apiBaseUrl}admin/task_reassign/report`, { params });
  }

  getallUsers(): Observable<any[]> {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/active_users`);
  }

  findByActiveClient() {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/active_clients`);
  }

  activeCompanyList() {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/company/active_company`);
  }

  //Shift
  getCompanyShifts(companyId: number): Observable<ApiResponse<CompanyShift[]>> {
    return this.http.get<ApiResponse<CompanyShift[]>>(`${environment.apiBaseUrl}admin/companyShift/viewList/${companyId}`);
  }

  getCompanyShiftById(shiftId: number): Observable<ApiResponse<CompanyShift>> {
    return this.http.get<ApiResponse<CompanyShift>>(`${environment.apiBaseUrl}admin/companyShift/viewById/${shiftId}`);
  }

  addCompanyShift(body: CompanyShift): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${environment.apiBaseUrl}admin/companyShift/add`, body);
  }

  updateCompanyShift(body: CompanyShift): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(`${environment.apiBaseUrl}admin/companyShift/update`, body);
  }

  deleteCompanyShift(shiftId: number, userId: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${environment.apiBaseUrl}admin/companyShift/delete/${shiftId}/${userId}`);
  }

  findActiveCompanyShift(companyId: number) {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/company/company_shift/${companyId}`);
  }

  getActiveDepartmentsList() {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/department/active_department_list`);
  }

  //buddy
  updateTaskBuddy(taskId: number, buddyId: number, userId: any, isChange: boolean, remarks: string, startDate: string | null, endDate: string | null) {
    return this.http.put<any>(`${environment.apiBaseUrl}admin/task/updateTaskBuddy`, {
      taskId,
      buddyId,
      userId,
      isChange,
      remarks,
      startDate,
      endDate,
    });
  }

  getReassignSummaryReportDepartments(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiBaseUrl}admin/task_reassign/reassign-summary/departments`);
  }

  getOldUserTaskCount(page: number, size: number, fromDate?: string, toDate?: string, search?: string, departmentIds?: number[]) {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }

    if (toDate) {
      params = params.set('toDate', toDate);
    }

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    if (departmentIds && departmentIds.length > 0) {
      params = params.set('departmentIds', departmentIds.join(','));
    }

    return this.http.get<any>(`${environment.apiBaseUrl}admin/task_reassign/old-user-task-count`, { params });
  }

  getTransactionHistory(page: number, size: number, search?: string, moduleId?: number, userId?: number, fromDate?: string, toDate?: string) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('search', search || '')
      .set('moduleId', (moduleId || 0).toString())
      .set('userId', (userId || 0).toString());

    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }

    if (toDate) {
      params = params.set('toDate', toDate);
    }

    return this.http.get<any>(`${environment.apiBaseUrl}admin/transaction/transaction-history`, { params });
  }

  getActiveModules() {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/transaction/getActiveModules`);
  }

  getTransactionActionUsers() {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/transaction/getTransactionActionUsers`);
  }

  getReopenReport(page: number, size: number, search?: string, fromDate?: string, toDate?: string, assignedToId?: number | null, reopenById?: number | null) {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    if (search) {
      params = params.set('search', search);
    }

    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }

    if (toDate) {
      params = params.set('toDate', toDate);
    }

    if (assignedToId != null && assignedToId !== 0) {
      params = params.set('assignedToId', assignedToId.toString());
    }

    if (reopenById != null && reopenById !== 0) {
      params = params.set('reopenById', reopenById.toString());
    }

    return this.http.get<any>(`${environment.apiBaseUrl}admin/reopen-report`, { params });
  }

  getReopenReportAssignedUsers() {
    return this.http.get<any[]>(`${environment.apiBaseUrl}admin/reopen-report/assigned-users`);
  }

  getReopenReportReopenedByUsers() {
    return this.http.get<any[]>(`${environment.apiBaseUrl}admin/reopen-report/reopened-by-users`);
  }

  getReopenCountByAssignedUser(page: number, size: number, search: string, fromDate: string, toDate: string, departmentIds: number[]) {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());


    if (search?.trim()) {
      params = params.set('search', search.trim());
    }


    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }


    if (toDate) {
      params = params.set('toDate', toDate);
    }


    if (departmentIds?.length) {
      params = params.set('departmentIds', departmentIds.join(','));
    }


    return this.http.get<any>(`${environment.apiBaseUrl}admin/reopen-report/assigned-user-count`, { params });
  }
}
