
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';

import { Common } from '../../../classes/common';
import { DataProviderService } from '../../../service/data-provider.service';

@Component({
  selector: 'app-view-service',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule
  ],
  templateUrl: './view-service.html',
  styleUrl: './view-service.scss'
})
export class ViewServiceComponent implements OnInit {

  serviceId!: number;

  service: any = {
    serviceId: null,
    name: '',
    status: null,
    userId: null
  };

  transactionHistory: any[] = [];

  common = new Common();

  constructor(
    private route: ActivatedRoute,
    private dataprovider: DataProviderService,
    private router: Router
  ) {}

  get hasTransactionHistory(): boolean {
    return Array.isArray(this.transactionHistory) &&
      this.transactionHistory.length > 0;
  }

  ngOnInit(): void {
    const serviceId = this.route.snapshot.paramMap.get('serviceId');

    if (serviceId) {
      this.serviceId = Number(serviceId);
      this.getServiceDetails();
    }
  }

  getServiceDetails(): void {
    this.dataprovider.getServiceById(this.serviceId).subscribe({
      next: (response: any) => {
        if (!response?.data) {
          console.error('Service data not found');
          return;
        }

        const data = response.data;

        this.service = {
          serviceId: data.serviceId,
          name: data.name,
          status: data.status,
          userId: data.userId
        };

        this.transactionHistory = Array.isArray(data.transactionHistory)
          ? [...data.transactionHistory]
          : [];

        this.transactionHistory.sort((a: any, b: any) => {
          const dateA = this.common.parseEntryDate(a.entryDate);
          const dateB = this.common.parseEntryDate(b.entryDate);

          return dateB.getTime() - dateA.getTime();
        });
      },

      error: (err: any) => {
        console.error('Failed to fetch service details', err);
      }
    });
  }

  backToIndexPage(): void {
    this.router.navigate(['/service-index']);
  }
}
