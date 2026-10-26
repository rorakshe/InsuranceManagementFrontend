
import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  PolicyServicingService,
  ServiceRequest,
  ServiceRequestUpdate
} from '../../../../../core/services/policy-servicing.service';

@Component({
  selector: 'app-policy-servicing',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule],
  templateUrl: './policy-servicing.html',
  styleUrl: './policy-servicing.scss'
})
export class PolicyServicing implements OnInit {
  searchText = '';
  selectedStatus = 'All';

  selectedRequest: ServiceRequest | null = null;

  requests: ServiceRequest[] = [];

  loading = false;
  errorMessage = '';
  actionMessage = '';

  // Use a valid staff/officer ID from your backend.
  actionBy = 1;

  readonly statuses: string[] = [
    'SUBMITTED',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED',
    'COMPLETED',
    'CLOSED'
  ];

  constructor(
    private readonly servicingService: PolicyServicingService
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.errorMessage = '';

    this.servicingService.getAllRequests().subscribe({
      next: (data: ServiceRequest[]) => {
        this.requests = Array.isArray(data) ? data : [];

        this.syncSelectedRequest();

        // Hide the loading message after the response arrives.
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;

        this.errorMessage =
          error?.error?.message ??
          'Could not load service requests. Check the backend on port 8081.';
      }
    });
  }

  get filteredRequests(): ServiceRequest[] {
    const search = this.searchText.trim().toLowerCase();

    return this.requests.filter((request) => {
      const matchesSearch =
        !search ||
        String(request.requestId).includes(search) ||
        (request.requestNumber ?? '').toLowerCase().includes(search) ||
        String(request.policyId).includes(search) ||
        String(request.customerId).includes(search) ||
        (request.requestType ?? '').toLowerCase().includes(search) ||
        (request.status ?? '').toLowerCase().includes(search) ||
        this.statusLabel(request.status).toLowerCase().includes(search);

      const matchesStatus =
        this.selectedStatus === 'All' ||
        request.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  get pendingCount(): number {
    return this.requests.filter(
      (request) => request.status === 'SUBMITTED'
    ).length;
  }

  get inReviewCount(): number {
    return this.requests.filter(
      (request) => request.status === 'UNDER_REVIEW'
    ).length;
  }

  get approvedCount(): number {
    return this.requests.filter(
      (request) => request.status === 'APPROVED'
    ).length;
  }

  get completedCount(): number {
    return this.requests.filter(
      (request) =>
        request.status === 'COMPLETED' ||
        request.status === 'CLOSED'
    ).length;
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      SUBMITTED: 'Submitted',
      UNDER_REVIEW: 'Under Review',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      COMPLETED: 'Completed',
      CLOSED: 'Closed'
    };

    return labels[status] ?? status;
  }

  viewRequest(request: ServiceRequest): void {
    this.selectedRequest = request;
    this.actionMessage = '';
    this.errorMessage = '';
  }

  closeDetails(): void {
    this.selectedRequest = null;
    this.actionMessage = '';
    this.errorMessage = '';
  }

  startReview(request: ServiceRequest): void {
    this.updateStatus(
      request,
      'UNDER_REVIEW',
      'Request moved to review successfully.'
    );
  }

  approveRequest(request: ServiceRequest): void {
    this.updateStatus(
      request,
      'APPROVED',
      'Request approved successfully.'
    );
  }

  rejectRequest(request: ServiceRequest): void {
    this.updateStatus(
      request,
      'REJECTED',
      'Request rejected successfully.'
    );
  }

  completeRequest(request: ServiceRequest): void {
    this.updateStatus(
      request,
      'COMPLETED',
      'Request marked as completed.'
    );
  }

  closeRequest(request: ServiceRequest): void {
    this.updateStatus(
      request,
      'CLOSED',
      'Request closed successfully.'
    );
  }

  private updateStatus(
    request: ServiceRequest,
    status: string,
    successMessage: string
  ): void {
    this.errorMessage = '';
    this.actionMessage = '';

    const officerId = Number(this.actionBy);

    if (!Number.isInteger(officerId) || officerId <= 0) {
      this.errorMessage =
        'Enter a valid positive staff/officer ID.';
      return;
    }

    const payload: ServiceRequestUpdate = {
      status,
      actionBy: officerId,
      remarks: `Status updated to ${status}`
    };

    this.servicingService
      .updateRequest(request.requestId, payload)
      .subscribe({
        next: (updatedRequest: ServiceRequest) => {
          const index = this.requests.findIndex(
            (item) => item.requestId === request.requestId
          );

          if (index !== -1) {
            this.requests[index] = updatedRequest;
          }

          this.selectedRequest = updatedRequest;

          this.actionMessage = successMessage;

          // Refresh the list from the source of truth.
          this.loadRequests();
        },
        error: (error) => {
          this.errorMessage =
            error?.error?.message ??
            `Could not update the request to ${status}. Check the officer ID and backend response.`;
        }
      });
  }

  private syncSelectedRequest(): void {
    if (!this.selectedRequest) {
      return;
    }

    const matchingRequest = this.requests.find(
      (request) =>
        request.requestId === this.selectedRequest?.requestId
    );

    if (matchingRequest) {
      this.selectedRequest = matchingRequest;
    }
  }
}
