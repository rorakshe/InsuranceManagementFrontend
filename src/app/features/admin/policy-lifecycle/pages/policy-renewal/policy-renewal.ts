
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  PolicyRenewal as PolicyRenewalRecord,
  PolicyRenewalRequest,
  PolicyRenewalService
} from '../../../../../core/services/policy-renewal.service';

@Component({
  selector: 'app-policy-renewal',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './policy-renewal.html',
  styleUrl: './policy-renewal.scss'
})
export class PolicyRenewal implements OnInit {
  searchText = '';
  selectedStatus = 'All';
  selectedPolicy: PolicyRenewalRecord | null = null;

  policies: PolicyRenewalRecord[] = [];
  loading = false;
  saving = false;
  errorMessage = '';
  actionMessage = '';

  showCreateForm = false;

  renewalForm: PolicyRenewalRequest = {
    policyId: 0,
    renewalDate: '',
    newExpiryDate: '',
    premiumAmount: 0
  };

  constructor(
    private readonly renewalService: PolicyRenewalService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRenewals();
  }

  loadRenewals(): void {
    this.loading = true;
    this.errorMessage = '';
    this.actionMessage = '';

    this.renewalService.getAllRenewals().subscribe({
      next: (renewals) => {
        this.policies = Array.isArray(renewals) ? renewals : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: unknown) => {
        console.error('Failed to load policy renewals:', error);
        this.errorMessage =
          'Unable to load renewals. Check that the Policy Renewal backend is running on port 8082.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get statuses(): string[] {
    return [
      ...new Set(
        this.policies
          .map(policy => String(policy.renewalStatus))
          .filter(Boolean)
      )
    ];
  }

  get filteredPolicies(): PolicyRenewalRecord[] {
    const query = this.searchText.trim().toLowerCase();

    return this.policies.filter(policy => {
      const searchableText = [
        policy.renewalId,
        policy.policyId,
        policy.renewalStatus,
        policy.premiumAmount,
        policy.renewalDate,
        policy.newExpiryDate
      ].join(' ').toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);

      const matchesStatus =
        this.selectedStatus === 'All' ||
        String(policy.renewalStatus) === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  get dueCount(): number {
    return this.policies.filter(policy =>
      /due/i.test(String(policy.renewalStatus))
    ).length;
  }

  get pendingCount(): number {
    return this.policies.filter(policy =>
      /pending/i.test(String(policy.renewalStatus))
    ).length;
  }

  get renewedCount(): number {
    return this.policies.filter(policy =>
      /renewed|completed|success/i.test(String(policy.renewalStatus))
    ).length;
  }

  get paymentVerifiedCount(): number {
    return this.policies.filter(policy => policy.paymentVerified).length;
  }

  viewPolicy(policy: PolicyRenewalRecord): void {
    this.selectedPolicy = policy;
    this.actionMessage = '';
  }

  closeDetails(): void {
    this.selectedPolicy = null;
  }

  openCreateForm(): void {
    this.renewalForm = {
      policyId: 0,
      renewalDate: new Date().toISOString().slice(0, 10),
      newExpiryDate: '',
      premiumAmount: 0
    };
    this.errorMessage = '';
    this.actionMessage = '';
    this.showCreateForm = true;
  }

  closeCreateForm(): void {
    this.showCreateForm = false;
  }

  createRenewal(): void {
    if (
      !Number.isInteger(Number(this.renewalForm.policyId)) ||
      Number(this.renewalForm.policyId) <= 0 ||
      !this.renewalForm.renewalDate ||
      !this.renewalForm.newExpiryDate ||
      Number(this.renewalForm.premiumAmount) <= 0
    ) {
      this.errorMessage = 'Enter a valid policy ID, both dates, and a premium amount greater than zero.';
      return;
    }

    if (this.renewalForm.newExpiryDate <= this.renewalForm.renewalDate) {
      this.errorMessage = 'The new expiry date must be later than the renewal date.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    this.renewalService.createRenewal({
      ...this.renewalForm,
      policyId: Number(this.renewalForm.policyId),
      premiumAmount: Number(this.renewalForm.premiumAmount)
    }).subscribe({
      next: (renewal) => {
        this.saving = false;
        this.showCreateForm = false;
        this.actionMessage = `Renewal ${renewal.renewalId} created successfully.`;
        this.loadRenewals();
      },
      error: (error: unknown) => {
        console.error('Failed to create renewal:', error);
        this.saving = false;
        this.errorMessage =
          'Unable to create renewal. Check the entered values and backend response.';
        this.cdr.detectChanges();
      }
    });
  }

  sendReminder(policy: PolicyRenewalRecord): void {
    this.runAction(
      policy,
      () => this.renewalService.sendReminder(policy.renewalId),
      'Reminder sent successfully.'
    );
  }

  confirmCustomer(policy: PolicyRenewalRecord): void {
    this.runAction(
      policy,
      () => this.renewalService.confirmCustomer(policy.renewalId),
      'Customer confirmation recorded.'
    );
  }

  verifyPayment(
    policy: PolicyRenewalRecord,
    paymentSuccessful: boolean
  ): void {
    this.runAction(
      policy,
      () => this.renewalService.verifyPayment(
        policy.renewalId,
        paymentSuccessful
      ),
      paymentSuccessful
        ? 'Payment verification submitted successfully.'
        : 'Unsuccessful payment recorded.'
    );
  }

  private runAction(
    policy: PolicyRenewalRecord,
    request: () => import('rxjs').Observable<PolicyRenewalRecord>,
    successMessage: string
  ): void {
    this.errorMessage = '';
    this.actionMessage = '';

    request().subscribe({
      next: (updatedRenewal) => {
        const index = this.policies.findIndex(
          item => item.renewalId === updatedRenewal.renewalId
        );

        if (index !== -1) {
          this.policies[index] = updatedRenewal;
        }

        if (
          this.selectedPolicy?.renewalId === updatedRenewal.renewalId
        ) {
          this.selectedPolicy = updatedRenewal;
        }

        this.actionMessage =
          `${successMessage} Renewal ID: ${policy.renewalId}`;
        this.cdr.detectChanges();
      },
      error: (error: unknown) => {
        console.error('Renewal action failed:', error);
        this.errorMessage =
          'The action failed. Please check the backend response.';
        this.cdr.detectChanges();
      }
    });
  }
}
