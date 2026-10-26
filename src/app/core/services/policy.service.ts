
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Policy {
  policyId: number;
  policyNumber: string;
  quoteId: number;
  customerId: number;
  productId: number;
  issueDate: string;
  effectiveDate: string;
  expiryDate: string;
  policyStatus: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class PolicyService {
  private readonly apiUrl = 'http://localhost:8088/api/v1/policies';

  constructor(private http: HttpClient) {}

  getPolicies(): Observable<ApiResponse<Policy[]>> {
    return this.http.get<ApiResponse<Policy[]>>(this.apiUrl);
  }
}
