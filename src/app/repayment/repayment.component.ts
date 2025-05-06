import { Component, OnInit } from '@angular/core';
import { RepaymentService } from '../service/repayment.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import { Router } from '@angular/router';
import { PaymentComponent } from '../payment/payment.component';

declare var bootstrap: any;

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
  userIds!: string;
  isFilteringPending = false;
  errorMessage: string | null = null; 

  constructor(private router: Router, private repaymentService: RepaymentService) { }

  ngOnInit(): void {
    this.userId = localStorage.getItem('user') || '';
    if (!this.userId) {
      this.router.navigate(['/']);
    }
    this.loadRepaymentSchedule();
    this.loadOutstandingBalance();
  }

  logout(): void {
    localStorage.removeItem('user');
    this.router.navigate(['/']);
  }

  showLogoutModal(): void {
    const logoutModal = new bootstrap.Modal(document.getElementById('logoutModal'));
    logoutModal.show();
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
    this.repaymentService.getRepaymentSchedule(this.userId).subscribe({
      next: (data) => {
        this.repayments = data;
        this.repayments = this.repayments.tableRepayment;
        this.filteredRepayments = [...this.repayments];
      },
      error: (error) => {
        this.errorMessage = 'Failed to load repayment schedule. Please try again later.';
        setTimeout(() => (this.errorMessage = null), 3000);
      },
      complete: () => {
        console.log('Repayment schedule loaded successfully.');
      },
    });
  }
  
  loadOutstandingBalance(): void {
    this.repaymentService.getOutstandingBalance(this.userId).subscribe({
      next: (data) => {
        this.outstandingBalance = data.outstandingBalance;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load outstanding balance. Please try again later.';
        setTimeout(() => (this.errorMessage = null), 3000);
      },
      complete: () => {
        console.log('Outstanding balance loaded successfully.');
      },
    });
  }

  makePayment(repaymentId: number, amountDue: number, userId: string): void {
    this.isPaymentModalVisible = true;
    this.amountDue = amountDue;
    this.repaymentId = repaymentId;
    this.userId = userId;
  }

  onPaymentCompleted(repaymentId: number): void {
    console.log(repaymentId);
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

  downloadPDF(): void {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setFont('times', 'bold');
    doc.setTextColor(25, 25, 112);
    doc.text('Repayment Details', 10, 15);

    doc.setFontSize(12);
    doc.setFont('times', 'normal');
    doc.setTextColor(0, 0, 0);

    doc.setFont('times', 'bold');
    doc.text(`User: ${this.userId.split('@')[0]}`, 10, 25);
    doc.setFont('times', 'bold');
    doc.text(`Email: ${this.userId}`, 10, 30);
    doc.setFont('times', 'bold');
    doc.text(`Outstanding Balance:`, 120, 25);
    doc.setFont('times', 'normal');
    doc.text("Rs: " + `${this.outstandingBalance}`, 170, 25);

    const headers = [
      'S.NO',
      'Monthly Due',
      'Principal Repayment',
      'Interest',
      'Outstanding Balance',
      'Due Date',
      'Payment Date',
      'Status',
    ];

    const columnWidths = [10, 22, 27, 21, 28, 35, 36, 24];
    const startX = 5;
    let startY = 32;
    const cellHeight = 10;
    const fontSize = 8;

    doc.setFontSize(fontSize);
    doc.setFillColor(255, 204, 204);

    headers.forEach((header, index) => {
      const cellX = startX + columnWidths.slice(0, index).reduce((a, b) => a + b, 0);
      doc.setFillColor(255, 204, 204);
      doc.rect(cellX, startY, columnWidths[index], cellHeight, 'F');
      doc.setTextColor(0, 0, 0);
      doc.text(
        header,
        cellX + 1,
        startY + cellHeight / 3 + 4
      );
    });

    startY += cellHeight;
    this.filteredRepayments.forEach((repayment: any, rowIndex: number) => {
      const formatDate = (date: string) => {
        const parsedDate = new Date(date);
        return isNaN(parsedDate.getTime())
          ? 'N/A'
          : `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')} ${String(parsedDate.getHours()).padStart(2, '0')}:${String(parsedDate.getMinutes()).padStart(2, '0')}:${String(parsedDate.getSeconds()).padStart(2, '0')}`;
      };

      const rowData = [
        (rowIndex + 1).toString(),
        repayment.monthPay.toString(),
        repayment.principalRepayment.toString(),
        repayment.interest.toString(),
        repayment.outstandingBalance.toString(),
        formatDate(repayment.dueDate),
        formatDate(repayment.paymentDate || 'N/A'),
        repayment.status,
      ];

      rowData.forEach((data, colIndex) => {
        const cellX = startX + columnWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);
        doc.rect(cellX, startY, columnWidths[colIndex], cellHeight);
        doc.setTextColor(0, 0, 0);
        doc.text(
          data,
          cellX + 2,
          startY + cellHeight / 2 + 3
        );
      });

      startY += cellHeight;

      if (startY + cellHeight > doc.internal.pageSize.height - 10) {
        doc.addPage();
        startY = 10;
      }
    });
    doc.save(`${this.userId.split('@')[0]}RepaymentDetails.pdf`);
  }
}