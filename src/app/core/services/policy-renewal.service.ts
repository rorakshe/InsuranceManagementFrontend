
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PolicyRenewal {
  renewalId: number;
  policyId: number;
  renewalDate: string;
  newExpiryDate: string;
  premiumAmount: number;
  renewalStatus: string;
  reminderSent: boolean;
  customerConfirmed: boolean;
  paymentVerified: boolean;
}

export interface PolicyRenewalRequest {
  policyId: number;
  renewalDate: string;
  newExpiryDate: string;
  premiumAmount: number;
}

export interface PaymentVerificationRequest {
  paymentSuccessful: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PolicyRenewalService {

  private readonly apiUrl = 'http://localhost:8082/api/v1/renewals';

  constructor(private readonly http: HttpClient) {}

  getAllRenewals(): Observable<PolicyRenewal[]> {
    return this.http.get<PolicyRenewal[]>(this.apiUrl);
  }

  getRenewalById(renewalId: number): Observable<PolicyRenewal> {
    return this.http.get<PolicyRenewal>(
      `${this.apiUrl}/${renewalId}`
    );
  }

  getRenewalsByPolicyId(policyId: number): Observable<PolicyRenewal[]> {
    return this.http.get<PolicyRenewal[]>(
      `${this.apiUrl}/policy/${policyId}`
    );
  }

  createRenewal(
    request: PolicyRenewalRequest
  ): Observable<PolicyRenewal> {
    return this.http.post<PolicyRenewal>(
      this.apiUrl,
      request
    );
  }

  sendReminder(renewalId: number): Observable<PolicyRenewal> {
    return this.http.post<PolicyRenewal>(
      `${this.apiUrl}/${renewalId}/reminder`,
      {}
    );
  }

  confirmCustomer(renewalId: number): Observable<PolicyRenewal> {
    return this.http.post<PolicyRenewal>(
      `${this.apiUrl}/${renewalId}/confirm`,
      {}
    );
  }

  verifyPayment(
    renewalId: number,
    paymentSuccessful: boolean
  ): Observable<PolicyRenewal> {
    const request: PaymentVerificationRequest = {
      paymentSuccessful
    };

    return this.http.post<PolicyRenewal>(
      `${this.apiUrl}/${renewalId}/verify-payment`,
      request
    );
  }
}
