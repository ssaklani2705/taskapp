import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../classes/ApiResponse';
import { ResponseApi } from '../classes/response-api.model';

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
  departmentId?: number;
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

@Injectable({
  providedIn: 'root'
})
export class DataProviderService {

  constructor(private http: HttpClient) { }

  //Dashboard
  getTodaysFollowup(userId: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/dashboard/getTodaysFollowup?userId=${userId}`);
  }

  getQuotationCount(startDate: any, endDate: any,
    userId: any,
    isAdmin: string
  ): Observable<any> {
    return this.http.get(
      `${environment.apiBaseUrl}admin/dashboard/stats?startDate=${startDate}&endDate=${endDate}&userId=${userId}&isAdmin=${isAdmin}`
    );
  }

  //User Management
  // getUserManagementDetails(page: any, size: any, statusIndex: any, search: any): Observable<any> {
  //   return this.http.get(`${environment.apiBaseUrl}admin/getUserManagementDetails?page=${page}&size=${size}&statusIndex=${statusIndex}&search=${search}`);
  // }

  getUserManagementDetails(
  page: any,
  size: any,
  statusIndex: any,
  search: any,
  departmentId: number | null,
  designationId: number | null
): Observable<any> {

  return this.http.get(
    `${environment.apiBaseUrl}admin/getUserManagementDetails` +
    `?page=${page}` +
    `&size=${size}` +
    `&statusIndex=${statusIndex}` +
    `&search=${encodeURIComponent(search || '')}` +
    `&departmentId=${departmentId ?? '0'}` +
    `&designationId=${designationId ?? '0'}`
  );

}


  // getUserManagementDetailsById(id: any): Observable<any> {
  //   return this.http.get(`${environment.apiBaseUrl}admin/getUserManagementDetails/${id}`);
  // }
  getUserManagementDetailsById(id: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/getUserManagementDetails/${id}`);
  }
  saveUserManagementDetailsDetail(userRequest: any) {
    return this.http.post<ResponseApi>(
      `${environment.apiBaseUrl}admin/saveUserDetail`,
      userRequest,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
    );
  }
  deleteUserManagement(id: number, createdBy: string): Observable<any> {
    const params = { userId: id, createdBy: createdBy };
    return this.http.post(`${environment.apiBaseUrl}admin/deleteUser`, null, { params });
  }

  //Company Master
  getCompanyDetails(page: any, size: any, statusIndex: any, search: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/getCompanyDetails?page=${page}&size=${size}&statusIndex=${statusIndex}&search=${search}`);
  }

  saveCompany(company: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.apiBaseUrl}admin/saveCompanyDetails`, company);
  }
  // Delete company
  deleteCompany(company: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}admin/deleteCompany`, company);
  }
  // Get company by ID
  getCompanyById(companyId: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/company/${companyId}`);
  }

  saveFollowUp(followUp: any): Observable<any> {
    return this.http.post<any>(`${environment.apiBaseUrl}admin/followup/saveFollowUp`, followUp);
  }
  // New method to get follow-ups by clientId and userId
  getFollowUpsByClientAndUser(clientId: number, userId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/followup/getByClientAndUser`, {
      params: {
        clientId: clientId.toString(),
        userId: userId.toString()
      }
    });
  }

  getFeedbacksByClientAndUser(clientId: number, userId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}admin/feedback/getByClientAndUser`, {
      params: {
        clientId: clientId.toString(),
        userId: userId.toString()
      }
    });
  }

  saveFeedback(feedback: Feedback): Observable<ApiResponse<Feedback>> {
    let params = new HttpParams()
      .set('clientId', feedback.clientId)
      .set('remarks', feedback.remarks)
      .set('userId', feedback.userId)
      .set('date', feedback.date); // pass as string
    return this.http.post<ApiResponse<Feedback>>(`${environment.apiBaseUrl}admin/feedback/saveFeedback`, null, { params });
  }

  getActiveUsers(): Observable<UserActiveDTO[]> {
    return this.http.get<UserActiveDTO[]>(`${environment.apiBaseUrl}admin/active`);
  }

  getActiveStates(): Observable<StateDTO[]> {
    return this.http.get<StateDTO[]>(`${environment.apiBaseUrl}admin/state/active`);
  }

  getCountry(): Observable<CountryDTO[]> {
    return this.http.get<CountryDTO[]>(`${environment.apiBaseUrl}admin/state/getCountry`);
  }

  getAllFeedback(page: any, size: any, statusIndex: any, search: any, user: any, fromDate?: string, toDate?: string): Observable<any> {
    let url = `${environment.apiBaseUrl}admin/feedback/getAllFeedback?page=${page}&size=${size}&statusIndex=${statusIndex}&user=${user}&search=${encodeURIComponent(search || '')}`;

    if (fromDate) {
      url += `&fromDate=${encodeURIComponent(fromDate)}`;
    }

    if (toDate) {
      url += `&toDate=${encodeURIComponent(toDate)}`;
    }

    return this.http.get(url);
  }

  getFollowupReport(page: any, size: any, statusIndex: any, search: any, fromDate?: string, toDate?: string, isAdmin?: string, userId?: any, user?: any, customerId?: any): Observable<any> {
    let url = `${environment.apiBaseUrl}admin/followup/getFollowupReport?page=${page}&size=${size}&statusIndex=${statusIndex}&userId=${userId}&isAdmin=${isAdmin}&user=${user}&search=${encodeURIComponent(search || '')}`;

    if (fromDate) {
      url += `&fromDate=${encodeURIComponent(fromDate)}`;
    }

    if (toDate) {
      url += `&toDate=${encodeURIComponent(toDate)}`;
    }

    if (customerId) {
      url += `&customerId=${customerId}`;
    }
    return this.http.get(url);
  }

  closeFollowUp(followUpId: number, userId: number) {
    return this.http.post<ApiResponse<any>>(`${environment.apiBaseUrl}admin/followup/closeFollowUp/${followUpId}/${userId}`, {});
  }

  getSizeDetails(page: any, size: any, statusIndex: any, search: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/sizeMaster/getSize?page=${page}&size=${size}&statusIndex=${statusIndex}&search=${search}`);
  }


  getCity(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/getCity`);
  }

  getContactPerson(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/getContactPerson`);
  }

  getSelectedDia(inputSrNo: any, selectedCompany: any, warehouseId: any, gradeId: any, shape: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}quotation/getSelectedDia?srNo=${inputSrNo}&companyId=${selectedCompany}&gradeId=${gradeId}&warehouseId=${warehouseId}&shape=${shape}`);
  }

  getSelectedHeatNo(inputSrNo: any, selectedCompany: any, warehouseId: any, gradeId: any, shape: any, inputDia: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}quotation/getSelectedHeatNo?srNo=${inputSrNo}&companyId=${selectedCompany}&gradeId=${gradeId}&warehouseId=${warehouseId}&shape=${shape}&dia=${inputDia}`);
  }

  getSelectedHeatNoForFlat(inputSrNo: any, selectedCompany: any, warehouseId: any, gradeId: any, shape: any, selectedSize: any, inputWidth: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}quotation/getSelectedHeatNoForRound?srNo=${inputSrNo}&companyId=${selectedCompany}&gradeId=${gradeId}&warehouseId=${warehouseId}&shape=${shape}&thickness=${selectedSize}&width=${inputWidth}`);
  }

  getThickness(inputSrNo: any, selectedCompany: any, warehouseId: any, gradeId: any, shape: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}quotation/getThickness?srNo=${inputSrNo}&companyId=${selectedCompany}&gradeId=${gradeId}&warehouseId=${warehouseId}&shape=${shape}`);
  }

  getWidth(inputSrNo: any, selectedCompany: any, warehouseId: any, gradeId: any, shape: any, thickness: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}quotation/getSelectedWidth?srNo=${inputSrNo}&companyId=${selectedCompany}&gradeId=${gradeId}&warehouseId=${warehouseId}&shape=${shape}&thickness=${thickness}`);
  }

  getSizeName(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}quotation/getSizeName`);
  }


  getActiveClient(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/getActiveClient`);
  }


  //Reports mail
  getMailLogDetails(page: any, size: any, statusIndex: any, search: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}mailLog/getMailLogDetails?page=${page}&size=${size}&statusIndex=${statusIndex}&search=${search}`);
  }

  // data-provider.service.ts
  getMailLogHtml(mailLogId: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}mailLog/getMailLogHtml?mailLogId=${mailLogId}`);
  }

  getUserAccessDetails(page: any, size: any, statusIndex: any, search: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}useraccesslog/getUserAccessDetails?page=${page}&size=${size}&statusIndex=${statusIndex}&search=${search}`);
  }



  deleteUser(id: number, createdBy: string): Observable<any> {
    const params = { userId: id, createdBy: createdBy };
    return this.http.post(`${environment.apiBaseUrl}api/deleteUser`, null, { params });
  }
  saveUserDetail(userRequest: any) {
    return this.http.post<ResponseApi>(
      `${environment.apiBaseUrl}api/saveUserDetail`,
      userRequest,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
    );

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



  searchContactPersonName(search: string): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/getContactPersonName?search=${search}`);
  }

  getContactPersonNameForVendor(search: string): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/getContactPersonNameForVendor?search=${search}`);
  }


  getAllClient(search: string, userId: number, isAdmin: string): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/getAllClient?search=${search}&userId=${userId}&isAdmin=${isAdmin}`);
  }


  // Unit Master
  getUnitDetails(
    page: any,
    size: any,
    statusIndex: any,
    search: any,
  ): Observable<any> {
    return this.http.get(
      `${environment.apiBaseUrl}admin/unit/getUnitDetails?page=${page}&size=${size}&statusIndex=${statusIndex}&search=${search}`,
    );
  }

  getDepartmentDetails(
  page: number,
  size: number,
  statusIndex: number,
  search: string,
): Observable<any> {
  const params = {
    page: page.toString(),
    size: size.toString(),
    statusIndex: statusIndex.toString(),
    search: search || '',
  };

  return this.http.get(
    `${environment.apiBaseUrl}admin/department/getDepartmentDetails`,
    { params },
  );
}

saveDepartment(
  department: any,
): Observable<any> {

  return this.http.post(
    `${environment.apiBaseUrl}admin/department/saveDepartment`,
    department,
  );
}

getDepartmentById(
  departmentId: any,
): Observable<any> {

  return this.http.get(
    `${environment.apiBaseUrl}admin/department/${departmentId}`,
  );
}

deleteDepartment(department: any): Observable<any> {
  return this.http.post(
    `${environment.apiBaseUrl}admin/department/deleteDepartment`,
    department
  );
}

getDesigmationDetails(
  page: any,
  size: any,
  statusIndex: any,
  search: any,
): Observable<any> {

  return this.http.get(
    `${environment.apiBaseUrl}admin/designation/getDesignationDetails?page=${page}&size=${size}&statusIndex=${statusIndex}&search=${search}`,
  );
}


getDesigmationById(
  designationId: any,
): Observable<any> {

  return this.http.get(
    `${environment.apiBaseUrl}admin/designation/${designationId}`,
  );
}

saveDesigmation(
  desigmation: any,
): Observable<any> {

  return this.http.post(
    `${environment.apiBaseUrl}admin/designation/saveDesignation`,
    desigmation,
  );
}

deleteDesigmation(
  desigmation: any,
): Observable<any> {

  return this.http.post(
    `${environment.apiBaseUrl}admin/designation/deleteDesignation`,
    desigmation,
  );
}

getActiveDesigmations(): Observable<any> {

  return this.http.get(
    `${environment.apiBaseUrl}admin/designation/active`,
  );
}

//Task Category
getTaskCategoryDetails(
  page: any,
  size: any,
  statusIndex: any,
  search: any,
  departmentId: any
): Observable<any> {

  return this.http.get(
    `${environment.apiBaseUrl}admin/taskcategory/getTaskCategoryDetails` +
    `?page=${page}` +
    `&size=${size}` +
    `&statusIndex=${statusIndex}` +
    `&search=${encodeURIComponent(search || '')}` +
    `&departmentId=${departmentId || 0}`
  );
}

getTaskCategoryById(
  taskcategoryId: number,
): Observable<any> {
  return this.http.get(
    `${environment.apiBaseUrl}admin/taskcategory/${taskcategoryId}`,
  );
}
saveTaskCategory(
  taskCategory: any,
): Observable<any> {
  return this.http.post(
    `${environment.apiBaseUrl}admin/taskcategory/saveTaskCategory`,
    taskCategory,
  );
}
deleteTaskCategory(
  taskCategory: any,
): Observable<any> {
  return this.http.post(
    `${environment.apiBaseUrl}admin/taskcategory/deleteTaskCategory`,
    taskCategory,
  );
}
getActiveTaskCategories(): Observable<any> {
  return this.http.get(
    `${environment.apiBaseUrl}admin/taskcategory/active`,
  );
}


getActiveDepartments(): Observable<any> {

  return this.http.get(
    `${environment.apiBaseUrl}admin/department/active`
  );
}



  saveUnit(unit: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${environment.apiBaseUrl}admin/unit/saveUnit`,
      unit,
    );
  }

  

  deleteUnit(unit: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${environment.apiBaseUrl}admin/unit/deleteUnit`,
      unit,
    );
  }

  getUnitById(uomId: number): Observable<any> {
    return this.http.get<ApiResponse<any>>(
      `${environment.apiBaseUrl}admin/unit/${uomId}`,
    );
  }

  //Vendor Master
  // Get Vendor List (Main API)
  getVendorDetails(
    page: any,
    size: any,
    statusIndex: any,
    search: any,
    isAdmin: any,
    userId: any,
    selectedAssignedTo: any,
    selectedCityName: any,
    contactPersonAndCompanyName: any,
    sortColumn: string,
    sortDirection: string,
  ): Observable<any> {
    return this.http.get(
      `${environment.apiBaseUrl}admin/getVendorDetails?page=${page}&size=${size}&statusIndex=${statusIndex}&search=${search}&isAdmin=${isAdmin}&userId=${userId}&selectedAssignedTo=${selectedAssignedTo}&sortColumn=${sortColumn}&sortDirection=${sortDirection}&city=${selectedCityName || ''}&contactPersonAndCompanyName=${contactPersonAndCompanyName || ''}`,
    );
  }

  // Second Vendor API (with vendorId filter)
  getVendorList(
    page: number,
    size: number,
    statusIndex: number,
    search: string,
    isAdmin: string,
    userId: number,
    selectedAssignedTo: number,
    selectedCityName?: string,
    contactPersonAndCompanyName?: string,
    sortColumn: string = 'status',
    sortDirection: string = 'asc',
    selectedContactPersonCustomerId?: any
  ): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/getVendorDetails`, {
      params: {
        page: page.toString(),
        size: size.toString(),
        statusIndex: statusIndex.toString(),
        search: search || '',
        isAdmin: isAdmin,
        userId: userId.toString(),
        selectedAssignedTo: selectedAssignedTo.toString(),
        city: selectedCityName || '',
        contactPersonAndCompanyName: contactPersonAndCompanyName || '',
        sortColumn: sortColumn,
        sortDirection: sortDirection,
        contactPersonCustomerId: selectedContactPersonCustomerId || 0
      },
    });
  }

  // Save / Update Vendor
  saveVendor(vendor: any): Observable<any> {
    return this.http.post(
      `${environment.apiBaseUrl}admin/saveVendorDetails`,
      vendor,
    );
  }

  // Get Vendor by ID (Entity)
  getVendorById(vendorId: number): Observable<any> {
    return this.http.get(
      `${environment.apiBaseUrl}admin/getVendor/${vendorId}`,
    );
  }

  // Get Vendor Details (DTO + Transaction History)
  getVendorDetailsById(vendorId: number): Observable<any> {
    return this.http.get(
      `${environment.apiBaseUrl}admin/vendorDetails/${vendorId}`,
    );
  }

  // Delete Vendor
  deleteVendor(vendorId: number, userId: number): Observable<any> {
    const params = new HttpParams()
      .set('vendorId', vendorId)
      .set('userId', userId);

    return this.http.post(`${environment.apiBaseUrl}admin/deleteVendor`, null, {
      params,
    });
  }

  // Dropdown APIs

  getActiveVendor(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/getActiveVendor`);
  }

  getVendorCity(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/getVendorCity`);
  }

  getVendorContactPerson(): Observable<any> {
    return this.http.get(
      `${environment.apiBaseUrl}admin/getVendorContactPerson`,
    );
  }

  getAllVendor(search?: string): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/getAllVendor`, {
      params: {
        search: search || '',
      },
    });
  }

  searchVendorContactPerson(search?: string): Observable<any> {
    return this.http.get(
      `${environment.apiBaseUrl}admin/searchVendorContactPerson`,
      {
        params: {
          search: search || '',
        },
      },
    );
  }

  getActiveVendorUsers(): Observable<UserActiveDTO[]> {
    return this.http.get<UserActiveDTO[]>(
      `${environment.apiBaseUrl}admin/getActiveVendor`,
    );
  }

  uploadVendorsExcel(formData: FormData) {
    return this.http.post<any>(
      `${environment.apiBaseUrl}admin/uploadVendorsExcel`,
      formData,
    );
  }

  //Product Master
  getProductDetails(page: any, size: any, statusIndex: any, search: any, unitIndex: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/getProductDetails?page=${page}&size=${size}&statusIndex=${statusIndex}&search=${search}&unitIndex=${unitIndex}`);
  }

  saveProduct(product: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.apiBaseUrl}admin/saveProductDetails`, product);
  }
  // Delete Product
  deleteProduct(product: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}admin/deleteProduct`, product);
  }
  // Get Prdouct by ID
  getProductById(productId: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/product/${productId}`);
  }




  


  // Get state by ID
  getStateDetailById(stateId: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/state/statedetail/${stateId}`);
  }

  getActiveUnits() {
    return this.http.get<any[]>(`${environment.apiBaseUrl}admin/unit/active`);
  }

  getInventoryDetails(page: any, size: any, search: any, selectedUnit: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}inventory/getInventory?page=${page}&size=${size}&search=${search}&selectedUnit=${selectedUnit}`);
  }

  getInventoryExport(search: string, selectedUnit: string): Observable<any> {
    return this.http.get(
      `${environment.apiBaseUrl}inventory/getInventoryExport`,
      {
        params: {
          search: search,
          selectedUnit: selectedUnit,
        },
        responseType: 'blob',
      },
    );
  }

  getInvTransaction(search: any, productId: any, fromDate: any, toDate: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}inventory/getInvTransaction?search=${search}&productId=${productId}&fromDate=${fromDate}&toDate=${toDate}`);
  }

  getAllProduct(search: string): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}inventory/getAllProduct?search=${search}`);
  }

  getInvTransactionExport(search: any, productId: any, fromDate: any, toDate: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}inventory/getInvTransactionExport?search=${search}&productId=${productId}&fromDate=${fromDate}&toDate=${toDate}`, {
      responseType: 'blob'
    });
  }


  addOrUpdateQuotationDetails(
    quotationDetails: any,
    userId: any,
    quotationId: any,
  ): Observable<any> {
    return this.http.post<any>(
      `${environment.apiBaseUrl}quotation/addOrUpdateQuotationDetails?userId=${userId}&quotationId=${quotationId}`,
      quotationDetails,
    );
  }


  addProductDetails(
    quotationDetails: any,
    userId: any,
    quotationId: any,
  ): Observable<any> {
    return this.http.post<any>(
      `${environment.apiBaseUrl}quotation/addProductDetails?userId=${userId}&quotationId=${quotationId}`,
      quotationDetails,
    );
  }



  getProducts(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}quotation/getProducts`);
  }

  getQuotationDetails(
    page: number,
    size: number,
    statusIndex: number,
    search: string,
    priority: number,
    fromDate?: string,
    toDate?: string,
    clientId?: number,
    userId?: any,
    isAdmin?: string
  ): Observable<any> {

    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('statusIndex', statusIndex)
      .set('search', search || '')
      .set('priority', priority)
      .set('userId', userId)
      .set('isAdmin', isAdmin || '');



    // optional params
    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }

    if (toDate) {
      params = params.set('toDate', toDate);
    }

    if (clientId) {
      params = params.set('clientId', clientId);
    }

    return this.http.get(
      `${environment.apiBaseUrl}quotation/getQuotationDetails`,
      { params }
    );
  }

  deleteQuotationDetailsById(quotationDatalsId: number, createdBy: string): Observable<any> {
    const params = new HttpParams().set('deletedBy', createdBy);
    const url = `${environment.apiBaseUrl}quotation/deleteQuotationDetailsById/${quotationDatalsId}`;

    return this.http.post(url, null, { params });
  }



  updateQuotationStatus(formData: FormData) {
    return this.http.put<any>(`${environment.apiBaseUrl}quotation/update-status`, formData);
  }



  deleteQuotation(payload: any) {
    return this.http.post<ApiResponseQuotation<any>>(
      `${environment.apiBaseUrl}quotation/deleteQuotation`,
      payload
    );
  }

  getDispatchDetails(
    page: number,
    size: number,
    statusIndex: number,
    search: string,
    priority: number,
    fromDate?: string,
    toDate?: string,
    clientId?: number,
    paymentStatus?: number,
    productionStatus?: any


  ): Observable<any> {

    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('statusIndex', statusIndex)
      .set('search', search || '')

      .set('priority', priority)
    
      .set('productionStatus', productionStatus);



    // optional params
    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }

    if (toDate) {
      params = params.set('toDate', toDate);
    }

    if (clientId) {
      params = params.set('clientId', clientId);
    }

    if (paymentStatus !== undefined && paymentStatus !== null) {
      params = params.set('paymentStatus', paymentStatus.toString());
    }

    return this.http.get(
      `${environment.apiBaseUrl}dispatch/getDispatchDetails`,
      { params }
    );
  }

  getQuotationDetailsById(quotationId: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}quotation/getQuotationDetailsById/${quotationId}`);
  }

  saveDispatch(formData: FormData) {
    return this.http.post<any>(
      `${environment.apiBaseUrl}dispatch/saveDispatch`,
      formData
    );
  }

  reverseDispatch(dispatchId: number) {
    return this.http.post<any>(
      `${environment.apiBaseUrl}dispatch/reverseDispatch/${dispatchId}`, {}
    );
  }

  getDispatchByQuotationId(quotationId: number) {
    return this.http.get(`${environment.apiBaseUrl}dispatch/getDispatchByQuotationId/${quotationId}`);
  }

  getQuotationById(quotationId: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}quotation/getQuotationById/${quotationId}`);
  }
  getProductByQuotationId(quotationId: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}quotation/getProductByQuotationId/${quotationId}`);
  }

  getCustomersDynamic(search: string, isAdmin: any, userId: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}quotation/getCustomersDynamic?search=${search}&isAdmin=${isAdmin}&userId=${userId}`);
  }

  getCustomersDynamicForAll(search: string, isAdmin: any, userId: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}quotation/getCustomersDynamicForAll?search=${search}&isAdmin=${isAdmin}&userId=${userId}`);
  }

  getCustomers(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}quotation/getCustomers`);
  }
  addOrUpdateQuotation(productDetailsData: any): Observable<any> {
    return this.http.post<any>(`${environment.apiBaseUrl}quotation/addOrUpdateQuotation`, productDetailsData);
  }

  getPurchasereportDetails(page: any, size: any, statusIndex: any, search: any, fromDate: any, toDate: any, vendorId: any, selectedUnit: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/purchasereport/getPurchasereportDetails?page=${page}&size=${size}&statusIndex=${statusIndex}&search=${search}&fromDate=${fromDate}&toDate=${toDate}&vendorId=${vendorId}&selectedUnit=${selectedUnit}`);
  }

  getGrnReportDetails(page: any, size: any, statusIndex: any, search: any, fromDate: any, toDate: any, selectedUnit: any, selectedVendorId: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/grnReport/getGrnReportDetail?page=${page}&size=${size}&statusIndex=${statusIndex}&search=${search}&fromDate=${fromDate}&toDate=${toDate}&selectedUnit=${selectedUnit}&selectedVendorId=${selectedVendorId}`);
  }

  getAllClientForDispatch(search: string): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/dispatchReport/getAllClient?search=${search}`);
  }

  getDispatchReportDetails(page: any, size: any, statusIndex: any, search: any, fromDate: any, toDate: any, clientId: any, selectedUnit: any,
    userId: any,
    isAdmin: any
  ): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/dispatchReport/getDispatchReportDetails?page=${page}&size=${size}&statusIndex=${statusIndex}&search=${search}&fromDate=${fromDate}&toDate=${toDate}&clientId=${clientId}&selectedUnit=${selectedUnit}&userId=${userId}&isAdmin=${isAdmin}`);
  }

  getProductUnit(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}admin/getProductUnit`);
  }

  getDispatchDetailsByDispatchId(dispatchId: number) {
    return this.http.get(`${environment.apiBaseUrl}dispatch/getDispatchDetailsByDispatchId/${dispatchId}`);
  }

  //SAVE PAYMENT
  savePayment(payload: any) {
    return this.http.post<any>(
      `${environment.apiBaseUrl}dispatch/savePayment`,
      payload
    );
  }

  //GET PAYMENTS BY QUOTATION
  getPaymentsByQuotation(quotationId: number) {
    return this.http.get<any>(
      `${environment.apiBaseUrl}dispatch/list/${quotationId}`
    );
  }

  reversePayment(paymentId: number) {
    return this.http.post(
      `${environment.apiBaseUrl}dispatch/reversePayment/${paymentId}`,
      {}
    );
  }

  getPurchaseDetails(
    page: number,
    size: number,
    statusIndex: number,
    grnIndex: number,
    paymentIndex: number,
    search: string,
    fromDate?: string,
    toDate?: string,
    clientId?: number
  ): Observable<any> {

    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('statusIndex', statusIndex)
      .set('grnIndex', grnIndex)
      .set('paymentIndex', paymentIndex)
      .set('search', search || '');

    // optional params
    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }

    if (toDate) {
      params = params.set('toDate', toDate);
    }

    if (clientId) {
      params = params.set('clientId', clientId);
    }

    return this.http.get(
      `${environment.apiBaseUrl}purchase/getPurchaseDetails`,
      { params }
    );
  }

  getVendorsDynamic(search: string): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}purchase/getVendorsDynamic?search=${search}`);
  }


  getSonoList(search: string, issueDate?: string): Observable<any> {
    let url = `${environment.apiBaseUrl}issuematerial/getSonoList?search=${search}`;

    if (issueDate) {
      url += `&issueDate=${issueDate}`;
    }

    return this.http.get(url);
  }

  getSonoListFilter(search: string): Observable<any> {
    let url = `${environment.apiBaseUrl}issuematerial/getSonoListFilter?search=${search}`;
    return this.http.get(url);
  }

  addOrUpdatePurchase(productDetailsData: any): Observable<any> {
    return this.http.post<any>(`${environment.apiBaseUrl}purchase/addOrUpdatePurchase`, productDetailsData);
  }

  addOrUpdateIssueOfRawMaterial(productDetailsData: any): Observable<any> {
    return this.http.post<any>(
      `${environment.apiBaseUrl}issuematerial/addOrUpdateIssueOfRawMaterial`,
      productDetailsData
    );
  }

  getissueMaterialByIssueId(issueId: number) {
    return this.http.get<any>(`${environment.apiBaseUrl}issuematerial/getissueMaterialByIssueId/${issueId}`);
  }

  addOrUpdatePurchaseDetails(
    quotationDetails: any,
    userId: any,
    poId: any,
  ): Observable<any> {
    return this.http.post<any>(
      `${environment.apiBaseUrl}purchase/addOrUpdatePurchaseDetails?userId=${userId}&poId=${poId}`,
      quotationDetails,
    );
  }

  addOrUpdateIssueDateils(
    quotationDetails: any,
    userId: any,
    poId: any,
    issueId: any
  ): Observable<any> {
    return this.http.post<any>(
      `${environment.apiBaseUrl}issuematerial/addOrUpdateIssueDateils?userId=${userId}&poId=${poId}&issueId=${issueId}`,
      quotationDetails,
    );
  }

  getProductByPurchaseId(poId: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}purchase/getProductByPurchaseId/${poId}`);
  }

  getProductByIssueId(poId: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}issuematerial/getProductByIssueId/${poId}`);
  }

  getPurchaseById(poId: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}purchase/getPurchaseById/${poId}`);
  }

  deletePoDetailsById(poDetailId: number, createdBy: string): Observable<any> {
    const params = new HttpParams().set('deletedBy', createdBy); // or 'createdBy', depending on your backend
    const url = `${environment.apiBaseUrl}purchase/deletePoDetailsById/${poDetailId}`;

    return this.http.post(url, null, { params });
  }
  getIssueOfRawMaterialDetails(
    page: number,
    size: number,
    statusIndex: number,
    grnIndex: number,
    paymentIndex: number,
    search: string,
    fromDate?: string,
    toDate?: string,
    quotationId?: number
  ): Observable<any> {

    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('statusIndex', statusIndex)
      .set('grnIndex', grnIndex)
      .set('paymentIndex', paymentIndex)
      .set('search', search || '');

    // optional params
    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }

    if (toDate) {
      params = params.set('toDate', toDate);
    }

    if (quotationId) {
      params = params.set('quotationId', (quotationId ?? 0).toString());
    }

    return this.http.get(
      `${environment.apiBaseUrl}issuematerial/getIssueOfRawMaterialDetails`,
      { params }
    );
  }


  eletePoDetailsById(poDetailId: number, createdBy: string): Observable<any> {
    const params = new HttpParams().set('deletedBy', createdBy); 
    const url = `${environment.apiBaseUrl}purchase/deletePoDetailsById/${poDetailId}`;

    return this.http.post(url, null, { params });
  }


  updatePurchaseStatus(formData: FormData) {
    return this.http.put<any>(`${environment.apiBaseUrl}purchase/update-status`, formData);
  }

  getPurchaseDetailById(poId: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}purchase/getPurchaseDetailById/${poId}`);
  }

  savePurchase(formData: FormData) {
    return this.http.post<any>(
      `${environment.apiBaseUrl}purchase/savePurchase`,
      formData
    );
  }

  deletePurchase(payload: any) {
    return this.http.post<ApiResponseQuotation<any>>(
      `${environment.apiBaseUrl}purchase/deletePurchase`,
      payload
    );
  }

  deleteIssue(payload: any) {
    return this.http.post<ApiResponseQuotation<any>>(
      `${environment.apiBaseUrl}issuematerial/deleteIssue`,
      payload
    );
  }

  savePoPayment(payload: any) {
    return this.http.post<any>(
      `${environment.apiBaseUrl}purchase/savePayment`,
      payload,
    );
  }

  getPaymentsByPo(poId: number) {
    return this.http.get<any>(
      `${environment.apiBaseUrl}dispatch/polist/${poId}`,
    );
  }

  getPurchaseByPoId(poId: number) {
    return this.http.get(`${environment.apiBaseUrl}purchase/getPurchaseByPoId/${poId}`);
  }

  issuematerial(issueId: number) {
    return this.http.get(`${environment.apiBaseUrl}issuematerial/getIssueByIssueId/${issueId}`);
  }

  getPurchaseDetailsByPoId(poId: number, grnId: number) {
    return this.http.get(`${environment.apiBaseUrl}purchase/getPurchaseDetailsByPoId/${poId}/${grnId}`);
  }

  reversePurchase(grnId: number) {
    return this.http.post<any>(
      `${environment.apiBaseUrl}purchase/reversePurchase/${grnId}`, {}
    );
  }

  reversePoPayment(paymentId: number) {
    return this.http.post(
      `${environment.apiBaseUrl}dispatch/reversePoPayment/${paymentId}`,
      {},
    );
  }

  getProductsDynamic(search: string): Observable<any> {
    return this.http.get(
      `${environment.apiBaseUrl}quotation/getProductsDynamic?search=${search}`
    );
  }

  getProductsWithAvaQtyDynamic(search: string): Observable<any> {
    return this.http.get(
      `${environment.apiBaseUrl}issuematerial/getProductsDynamic?search=${search}`
    );
  }

  issueMaterialList(page: any, size: any, statusIndex: any, search: any, fromDate: any, toDate: any, quotationId?: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}issue-material-report/getIssueMaterialList?page=${page}&size=${size}&statusIndex=${statusIndex}&search=${search}&fromDate=${fromDate}&toDate=${toDate}&quotationId=${quotationId}`);
  }

  updateProductionStatus(data: any): Observable<any> {
    return this.http.post(
      `${environment.apiBaseUrl}quotation/updateProductionStatus`,
      data
    );
  }

  updateProductStatus(productId: number, prodStatus: number, quotationId: number, userId: number): Observable<any> {
    return this.http.post(
      `${environment.apiBaseUrl}dispatch/updateProductStatus`,
      {
        productId: productId,
        prodStatus: prodStatus,
        quotationId: quotationId,
        userId: userId
      }
    );
  }

  SalesOrderList(page: any, size: any, statusIndex: any, search: any, fromDate: any, toDate: any, clientId: any, selectedUnit: any,
    selectedQuotationId: any,
    productionStatus: any
  ): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}sales-order-report/list?page=${page}&size=${size}&statusIndex=${statusIndex}&search=${search}&fromDate=${fromDate}&toDate=${toDate}&clientId=${clientId}&selectedUnit=${selectedUnit}&quotationId=${selectedQuotationId}&productionStatus=${productionStatus}`);
  }
  regeneratePurchasePDF(poId: number) {
    return this.http.post<any>(
      `${environment.apiBaseUrl}purchase/regeneratePurchasePDF/${poId}`, {}
    );
  }
  regenerateGRNPDF(grnId: number) {
    return this.http.post<any>(
      `${environment.apiBaseUrl}purchase/regenerateGRNPDF/${grnId}`, {}
    );
  }
  regenrateQuotationPdf(qId: number) {
    return this.http.post<any>(
      `${environment.apiBaseUrl}quotation/regenrateQuotationPdf/${qId}`, {}
    );
  }
  regenrateSalesOrderPdf(qId: number) {
    return this.http.post<any>(
      `${environment.apiBaseUrl}quotation/regenrateSalesOrderPdf/${qId}`, {}
    );
  }
  regenrateDispatchPdf(disId: number) {
    return this.http.post<any>(
      `${environment.apiBaseUrl}dispatch/regenrateDispatchPdf/${disId}`, {}
    );
  }
  updateDispatchStatus(data: any): Observable<any> {
    return this.http.post(
      `${environment.apiBaseUrl}dispatch/updateDispatchStatus`,
      data
    );
  }






  getOpeningBalanceDetails(
    page: number,
    size: number,
    statusIndex: number,
    search: string,
    fromDate?: string,
    toDate?: string,
    selectedProductId?: any
  ): Observable<any> {

    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('statusIndex', statusIndex)
      .set('search', search || '')
      .set('selectedProductId', selectedProductId || 0);

    // optional params
    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }

    if (toDate) {
      params = params.set('toDate', toDate);
    }

    return this.http.get(
      `${environment.apiBaseUrl}openingbalance/getOpeningBalanceDetails`,
      { params }
    );
  }

  saveOpeningBalance(data: any) {
  return this.http.post(
    `${environment.apiBaseUrl}openingbalance/save`,
    data
  );
}

openingbalanceByopeningBalanceId(openingBalanceId: number) {
    return this.http.get(`${environment.apiBaseUrl}openingbalance/getOpeningBalanceById/${openingBalanceId}`);
  }

  deleteopeningbalance(payload: any) {
    return this.http.post<ApiResponseQuotation<any>>(
      `${environment.apiBaseUrl}openingbalance/deleteopeningbalance`,
      payload
    );
  }

  uploadOpeningBalanceExcel(formData: FormData) {
    return this.http.post<any>(
      `${environment.apiBaseUrl}openingbalance/uploadOpeningBalanceExcel`,
      formData
    );
  }

  getCompanyRegDate() {
  return this.http.get(`${environment.apiBaseUrl}openingbalance/company/reg-date`);
}


getClientDetails(
    page: any,
    size: any,
    status: any,
    managerId: any,
    stateId: any,
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
    const params = new HttpParams()
      .set('clientId', clientId.toString())
      .set('userId', userId.toString());

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

  getTaskFilterData(): Observable<any> {

  return this.http.get<any>(
    `${environment.apiBaseUrl}admin/task/getTaskFilterData`
  );

}

getTaskDetails(
  page: number,
  size: number,
  statusIndex: number,
  search: string,
  clientId: number,
  taskCategoryId: number,
  assignedTo: number,
  priority: number
): Observable<any> {

  const params = new HttpParams()

    .set(
      'page',
      page.toString()
    )

    .set(
      'size',
      size.toString()
    )

    .set(
      'statusIndex',
      statusIndex.toString()
    )

    .set(
      'search',
      search || ''
    )

    .set(
      'clientId',
      clientId.toString()
    )

    .set(
      'taskCategoryId',
      taskCategoryId.toString()
    )

    .set(
      'assignedTo',
      assignedTo.toString()
    )

    .set(
      'priority',
      priority.toString()
    );


  return this.http.get<any>(

    `${environment.apiBaseUrl}admin/task/getTaskDetails`,

    { params }

  );

}


}
