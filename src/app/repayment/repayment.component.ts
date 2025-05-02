import { Component, OnInit } from '@angular/core';
import { RepaymentService } from '../service/repayment.service';
import { TableRepayment } from '../models/repayment.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentComponent } from '../payment/payment.component';

@Component({
  selector: 'app-repayment',
  standalone: true,
  imports: [CommonModule, FormsModule, PaymentComponent],
  templateUrl: './repayment.component.html',
  styleUrls: ['./repayment.component.css'],
})
export class RepaymentComponent implements OnInit {
  repaymentId?: number;
  amountDue?: number;
  repayments!: any;
  filteredRepayments!: any;
  isPaymentModalVisible = false;
  outstandingBalance = 0;
  userId = 'user1@gmail.com';
  isFilteringPending = false;

  constructor(private repaymentService: RepaymentService) { }

  ngOnInit(): void {
    this.loadRepaymentSchedule();
    this.loadOutstandingBalance();
  }

  toggleStatusFilter(): void {
    this.isFilteringPending = !this.isFilteringPending;
    this.filterByStatus(this.isFilteringPending ? 'PENDING' : 'ALL');
  }

  filterByStatus(status: string): void {
    if (status === 'ALL') {
      this.filteredRepayments = [...this.repayments];
    } else if (status === 'PENDING') {
      this.filteredRepayments = this.repayments.filter(
        (repayment: { status: string; }) => repayment.status === 'PENDING'
      );
    }
  }

  loadRepaymentSchedule(): void {
    this.repaymentService.getRepaymentSchedule(this.userId).subscribe((data) => {
      this.repayments = data;
      this.repayments = this.repayments.tableRepayment;
      this.filteredRepayments = [...this.repayments];
    });
  }

  loadOutstandingBalance(): void {
    this.repaymentService.getOutstandingBalance(this.userId).subscribe((data) => {
      this.outstandingBalance = data.outstandingBalance;
      console.log('Total Outstanding: ' + this.outstandingBalance);
    });
  }

  makePayment(repaymentId: number, amountDue: number, userId: string): void {
    this.isPaymentModalVisible = true;
    this.amountDue = amountDue;
    this.repaymentId = repaymentId;
    this.userId = userId;
  }

  onPaymentCompleted(repaymentId: number): void {
    alert(`Payment for repayment ID ${repaymentId} completed successfully.`);
    this.isPaymentModalVisible = false;
    this.loadRepaymentSchedule();
    this.loadOutstandingBalance();
  }

  onPaymentCancelled(): void {
    this.isPaymentModalVisible = false;
  }

  canMakePayment(index: number): boolean {
    if (index === 0) {
      return true;
    }
    return this.filteredRepayments[index - 1]?.status === 'COMPLETED';
  }
}