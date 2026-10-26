
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  Policy,
  PolicyService
} from '../../../../../core/services/policy.service';

@Component({
  selector: 'app-policy-issuance',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    DatePipe
  ],
  templateUrl: './policy-issuance.html',
  styleUrl: './policy-issuance.scss'
})
export class PolicyIssuance implements OnInit {

  policies: Policy[] = [];

  searchText = '';
  selectedStatus = 'All';

  selectedPolicy: Policy | null = null;

  loading = false;
  errorMessage = '';

  constructor(
    private readonly policyService: PolicyService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPolicies();
  }

  loadPolicies(): void {
    this.loading = true;
    this.errorMessage = '';

    this.policyService.getPolicies().subscribe({
      next: (response) => {
        console.log('Policy API response:', response);

        this.policies = Array.isArray(response?.data)
          ? response.data
          : [];

        console.log('Policies loaded:', this.policies.length);

        this.loading = false;
        this.cdr.detectChanges();
      },

      error: (error: unknown) => {
        console.error('Failed to load policies:', error);

        this.errorMessage =
          'Unable to load policies. Please check the backend connection.';

        this.loading = false;
        this.cdr.detectChanges();
      },

      complete: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredPolicies(): Policy[] {
    const search = this.searchText.trim().toLowerCase();

    return this.policies.filter((policy) => {
      const matchesSearch =
        !search ||
        policy.policyNumber.toLowerCase().includes(search) ||
        String(policy.policyId).includes(search) ||
        String(policy.customerId).includes(search) ||
        policy.policyStatus.toLowerCase().includes(search);

      const matchesStatus =
        this.selectedStatus === 'All' ||
        policy.policyStatus === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  get activeCount(): number {
    return this.policies.filter(
      policy => policy.policyStatus === 'ACTIVE'
    ).length;
  }

  get expiredCount(): number {
    return this.policies.filter(
      policy => policy.policyStatus === 'EXPIRED'
    ).length;
  }

  get cancelledCount(): number {
    return this.policies.filter(
      policy => policy.policyStatus === 'CANCELLED'
    ).length;
  }

  viewPolicy(policy: Policy): void {
    this.selectedPolicy = policy;
  }

  closeDetails(): void {
    this.selectedPolicy = null;
  }
}
