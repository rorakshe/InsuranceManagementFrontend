
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Pending';
}

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.scss'
})
export class CustomerList {
  searchText = '';

  // Temporary data until the backend API is connected.
  customers: Customer[] = [
    {
      id: 1,
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      phone: '9876543210',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Priya Patil',
      email: 'priya@example.com',
      phone: '9876543211',
      status: 'Pending'
    },
    {
      id: 3,
      name: 'Amit Deshmukh',
      email: 'amit@example.com',
      phone: '9876543212',
      status: 'Active'
    }
  ];

  get filteredCustomers(): Customer[] {
    const query = this.searchText.trim().toLowerCase();

    if (!query) {
      return this.customers;
    }

    return this.customers.filter(customer =>
      `${customer.id} ${customer.name} ${customer.email} ${customer.phone} ${customer.status}`
        .toLowerCase()
        .includes(query)
    );
  }
}
