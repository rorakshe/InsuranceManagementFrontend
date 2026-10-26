
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  CancellationDecisionRequest,
  PolicyCancellation,
  PolicyClosureService
} from '../../../../../core/services/policy-closure.service';

@Component({
  selector: 'app-policy-closure',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, RouterLink],
  templateUrl: './policy-closure.html',
  styleUrl: './policy-closure.scss'
})
export class PolicyClosure implements OnInit {
  searchText = '';
  selectedStatus = 'All';
  selectedRequest: PolicyCancellation | null = null;

  requests: PolicyCancellation[] = [];
  loading = false;
  saving = false;
  errorMessage = '';
  actionMessage = '';
  showCancelForm = false;

  cancellationForm = {
    policyId: 0,
    cancellationReason: ''
  };

  decisionForm = {
    approvedBy: 1,
    remarks: ''
  };

  constructor(
    private readonly closureService: PolicyClosureService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.errorMessage = '';

    this.closureService.getAllCancellations().subscribe({
      next: data => {
        this.requests = Array.isArray(data) ? data : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: unknown) => {
        console.error('Failed to load cancellation requests:', error);
        this.errorMessage =
          'Unable to load cancellation requests. Check the Closure backend on port 8083 and its CORS configuration.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get statuses(): string[] {
    return [...new Set(
      this.requests
        .map(request => request.requestStatus)
        .filter(Boolean)
    )];
  }

  get filteredRequests(): PolicyCancellation[] {
    const query = this.searchText.trim().toLowerCase();

    return this.requests.filter(request => {
      const searchable = [
        request.cancellationId,
        request.cancellationRequestNumber,
        request.policyId,
        request.cancellationReason,
        request.requestStatus,
        request.decisionRemarks
      ].join(' ').toLowerCase();

      return (!query || searchable.includes(query)) &&
        (this.selectedStatus === 'All' ||
          request.requestStatus === this.selectedStatus);
    });
  }

  get pendingCount(): number {
    return this.requests.filter(r => /pending/i.test(r.requestStatus)).length;
  }

  get approvedCount(): number {
    return this.requests.filter(r => /approved/i.test(r.requestStatus)).length;
  }

  get rejectedCount(): number {
    return this.requests.filter(r => /rejected/i.test(r.requestStatus)).length;
  }

  get closedCount(): number {
    return this.requests.filter(r => /closed|completed/i.test(r.requestStatus)).length;
  }

  viewRequest(request: PolicyCancellation): void {
    this.selectedRequest = request;
    this.actionMessage = '';
    this.errorMessage = '';
    this.decisionForm = {
      approvedBy: 1,
      remarks: request.decisionRemarks ?? ''
    };
  }

  closeDetails(): void {
    this.selectedRequest = null;
    this.actionMessage = '';
  }

  openCancelForm(): void {
    this.cancellationForm = { policyId: 0, cancellationReason: '' };
    this.errorMessage = '';
    this.actionMessage = '';
    this.showCancelForm = true;
  }

  closeCancelForm(): void {
    this.showCancelForm = false;
  }

  submitCancellation(): void {
    const policyId = Number(this.cancellationForm.policyId);
    const cancellationReason = this.cancellationForm.cancellationReason.trim();

    if (!Number.isInteger(policyId) || policyId <= 0 || !cancellationReason) {
      this.errorMessage = 'Enter a valid policy ID and cancellation reason.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    this.closureService.cancelPolicy(policyId, {
      cancellationReason
    }).subscribe({
      next: created => {
        this.saving = false;
        this.showCancelForm = false;
        this.actionMessage =
          `Cancellation request ${created.cancellationRequestNumber || created.cancellationId} submitted successfully.`;
        this.loadRequests();
      },
      error: (error: unknown) => {
        console.error('Failed to submit cancellation:', error);
        this.saving = false;
        this.errorMessage =
          'Unable to submit cancellation. Check the policy ID and backend response.';
        this.cdr.detectChanges();
      }
    });
  }

  approveRequest(request: PolicyCancellation): void {
    this.submitDecision(request, true);
  }

  rejectRequest(request: PolicyCancellation): void {
    this.submitDecision(request, false);
  }

  private submitDecision(
    request: PolicyCancellation,
    approve: boolean
  ): void {
    const approvedBy = Number(this.decisionForm.approvedBy);

    if (!Number.isInteger(approvedBy) || approvedBy <= 0) {
      this.errorMessage = 'Officer ID must be a positive number.';
      return;
    }

    const payload: CancellationDecisionRequest = {
      approvedBy,
      remarks: this.decisionForm.remarks.trim()
    };

    this.saving = true;
    this.errorMessage = '';
    this.actionMessage = '';

    const operation = approve
      ? this.closureService.approveCancellation(request.cancellationId, payload)
      : this.closureService.rejectCancellation(request.cancellationId, payload);

    operation.subscribe({
      next: updated => {
        this.saving = false;
        this.selectedRequest = updated;
        this.actionMessage = approve
          ? 'Cancellation request approved successfully.'
          : 'Cancellation request rejected successfully.';
        this.loadRequests();
      },
      error: (error: unknown) => {
        console.error('Cancellation decision failed:', error);
        this.saving = false;
        this.errorMessage =
          'Unable to process the decision. Verify the officer ID and backend response.';
        this.cdr.detectChanges();
      }
    });
  }
}
