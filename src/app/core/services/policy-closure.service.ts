
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PolicyCancellation {
  cancellationId: number;
  policyId: number;
  cancellationDate: string;
  cancellationReason: string;
  refundAmount: number;
  approvedBy: number | null;
  cancellationRequestNumber: string;
  requestStatus: string;
  decisionRemarks: string | null;
  decisionDate: string | null;
}

export interface PolicyCancellationRequest {
  cancellationReason: string;
}

export interface CancellationDecisionRequest {
  approvedBy: number;
  remarks?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PolicyClosureService {
  private readonly apiUrl =
    'http://localhost:8083/api/v1/cancellations';

  constructor(private readonly http: HttpClient) {}

  getAllCancellations(): Observable<PolicyCancellation[]> {
    return this.http.get<PolicyCancellation[]>(this.apiUrl);
  }

  getCancellationById(
    cancellationId: number
  ): Observable<PolicyCancellation> {
    return this.http.get<PolicyCancellation>(
      `${this.apiUrl}/${cancellationId}`
    );
  }

  getCancellationsByPolicyId(
    policyId: number
  ): Observable<PolicyCancellation[]> {
    return this.http.get<PolicyCancellation[]>(
      `${this.apiUrl}/policy/${policyId}`
    );
  }

  cancelPolicy(
    policyId: number,
    request: PolicyCancellationRequest
  ): Observable<PolicyCancellation> {
    return this.http.post<PolicyCancellation>(
      `${this.apiUrl}/policy/${policyId}`,
      request
    );
  }

  approveCancellation(
    cancellationId: number,
    request: CancellationDecisionRequest
  ): Observable<PolicyCancellation> {
    return this.http.put<PolicyCancellation>(
      `${this.apiUrl}/${cancellationId}/approve`,
      request
    );
  }

  rejectCancellation(
    cancellationId: number,
    request: CancellationDecisionRequest
  ): Observable<PolicyCancellation> {
    return this.http.put<PolicyCancellation>(
      `${this.apiUrl}/${cancellationId}/reject`,
      request
    );
  }
}
