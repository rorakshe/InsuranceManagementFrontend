
import { Routes } from '@angular/router';

// Layout components
import { AdminLayout } from './core/theme/layouts/admin-layout/admin-layout';
import { AgentLayout } from './core/theme/layouts/agent-layout/agent-layout';
import { CustomerLayout } from './core/theme/layouts/customer-layout/customer-layout';

// Dashboard components
import { Dashboard as AdminDashboard } from './features/admin/pages/dashboard/dashboard';
import { Dashboard as AgentDashboard } from './features/agent/pages/dashboard/dashboard';
import { Dashboard as CustomerDashboard } from './features/customer/pages/dashboard/dashboard';

// Policy Lifecycle components
import { PolicyDashboard } from './features/admin/policy-lifecycle/pages/policy-dashboard/policy-dashboard';
import { PolicyIssuance } from './features/admin/policy-lifecycle/pages/policy-issuance/policy-issuance';
import { PolicyRenewal } from './features/admin/policy-lifecycle/pages/policy-renewal/policy-renewal';
import { PolicyClosure } from './features/admin/policy-lifecycle/pages/policy-closure/policy-closure';
import { PolicyServicing } from './features/admin/policy-lifecycle/pages/policy-servicing/policy-servicing';

export const routes: Routes = [
  // Default: open your Policy Lifecycle module
  {
    path: '',
    redirectTo: 'admin/policy-lifecycle',
    pathMatch: 'full'
  },

  // ADMIN
  {
    path: 'admin',
    component: AdminLayout,
    children: [
      {
        path: '',
        redirectTo: 'policy-lifecycle',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: AdminDashboard
      },
      {
        path: 'policy-lifecycle',
        component: PolicyDashboard
      },
      {
        path: 'policy-lifecycle/issuance',
        component: PolicyIssuance
      },
      {
        path: 'policy-lifecycle/renewal',
        component: PolicyRenewal
      },
      {
        path: 'policy-lifecycle/closure',
        component: PolicyClosure
      },
      {
        path: 'policy-lifecycle/servicing',
        component: PolicyServicing
      }
    ]
  },

  // AGENT
  {
    path: 'agent',
    component: AgentLayout,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: AgentDashboard
      },
      {
        path: 'policy-lifecycle/issuance',
        component: PolicyIssuance
      },
      {
        path: 'policy-lifecycle/renewal',
        component: PolicyRenewal
      },
      {
        path: 'policy-lifecycle/closure',
        component: PolicyClosure
      },
      {
        path: 'policy-lifecycle/servicing',
        component: PolicyServicing
      }
    ]
  },

  // CUSTOMER
  {
    path: 'customer',
    component: CustomerLayout,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: CustomerDashboard
      },
      {
        path: 'policy-lifecycle/issuance',
        component: PolicyIssuance
      },
      {
        path: 'policy-lifecycle/renewal',
        component: PolicyRenewal
      },
      {
        path: 'policy-lifecycle/closure',
        component: PolicyClosure
      },
      {
        path: 'policy-lifecycle/servicing',
        component: PolicyServicing
      }
    ]
  },

  // Unknown URL
  {
    path: '**',
    redirectTo: 'admin/policy-lifecycle'
  }
];
