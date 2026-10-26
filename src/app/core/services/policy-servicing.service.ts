
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ServiceRequest {
  requestId: number;
  requestNumber: string;
  policyId: number;
  customerId: number;
  requestType: string;
  requestDate: string;
  status: string;
}

export interface ServiceRequestCreate {
  policyId: number;
  customerId: number;
  requestType: string;
  requestDetails: string;
}

export interface ServiceRequestUpdate {
  status: string;
  actionBy: number;
  remarks?: string;
}

export interface EndorsementRequest {
  requestId: number;
  endorsementType: string;
  previousValue?: string;
  updatedValue: string;
}

export interface EndorsementResponse {
  endorsementId: number;
  requestId: number;
  endorsementNumber: string;
  endorsementType: string;
  previousValue: string | null;
  updatedValue: string;
  approvalStatus: string;
}

@Injectable({
  providedIn: 'root'
})
export class PolicyServicingService {
  private readonly baseUrl = 'http://localhost:8081/api/v1';

  constructor(private readonly http: HttpClient) {}

  getAllRequests(): Observable<ServiceRequest[]> {
    return this.http.get<ServiceRequest[]>(
      `${this.baseUrl}/service-requests`
    );
  }

  getRequestById(id: number): Observable<ServiceRequest> {
    return this.http.get<ServiceRequest>(
      `${this.baseUrl}/service-requests/${id}`
    );
  }

  createRequest(
    request: ServiceRequestCreate
  ): Observable<ServiceRequest> {
    return this.http.post<ServiceRequest>(
      `${this.baseUrl}/service-requests`,
      request
    );
  }

  updateRequest(
    id: number,
    request: ServiceRequestUpdate
  ): Observable<ServiceRequest> {
    return this.http.put<ServiceRequest>(
      `${this.baseUrl}/service-requests/${id}`,
      request
    );
  }

  getAllEndorsements(): Observable<EndorsementResponse[]> {
    return this.http.get<EndorsementResponse[]>(
      `${this.baseUrl}/endorsements`
    );
  }

  createEndorsement(
    request: EndorsementRequest
  ): Observable<EndorsementResponse> {
    return this.http.post<EndorsementResponse>(
      `${this.baseUrl}/endorsements`,
      request
    );
  }

  approveEndorsement(id: number): Observable<EndorsementResponse> {
    return this.http.put<EndorsementResponse>(
      `${this.baseUrl}/endorsements/${id}/approve`,
      {}
    );
  }

  rejectEndorsement(id: number): Observable<EndorsementResponse> {
    return this.http.put<EndorsementResponse>(
      `${this.baseUrl}/endorsements/${id}/reject`,
      {}
    );
  }
}
