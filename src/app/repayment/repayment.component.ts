import { Component, OnInit } from '@angular/core';
import { RepaymentService } from '../service/repayment.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import { Router } from '@angular/router';
import { PaymentComponent } from '../payment/payment.component';


@Component({
  selector: 'app-repayment',
  standalone: true,
  imports: [CommonModule, FormsModule, PaymentComponent],
  templateUrl: './repayment.component.html',
  styleUrls: ['./repayment.component.css']
})

export class RepaymentComponent implements OnInit {
  repaymentId?: number;
  amountDue?: number;
  showLogoutModal = false;
  repayments!: any;
  filteredRepayments!: any;
  isPaymentModalVisible = false;
  outstandingBalance = 0;
  userId = 'user1@gmail.com';
  userIds!: string;
  isFilteringPending = false;
  errorMessage: string | null = null;
  loanType!: string;
  principalAmt!: number;
  InterestRate!: number;
  period!: number;

  constructor(private router: Router, private repaymentService: RepaymentService) { }

  ngOnInit(): void {
    this.userId = localStorage.getItem('user') || '';
    if (!this.userId) {
      this.router.navigate(['/']);
    }
    this.loadRepaymentSchedule();
    this.loadOutstandingBalance();
  }

  hideLogoutModal() {
    this.showLogoutModal = false;
  }

  confirmLogout() {
    this.showLogoutModal = false;
    localStorage.removeItem('user');
    this.router.navigate(['/']);
  }

  onLogout() {
    this.showLogoutModal = true;
  }

  toggleStatusFilter(): void {
    this.isFilteringPending = !this.isFilteringPending;
    this.filterByStatus(this.isFilteringPending ? 'DUE' : 'ALL');
  }

  filterByStatus(status: string): void {
    if (status === 'ALL') {
      this.filteredRepayments = [...this.repayments];
    } else if (status === 'DUE') {
      this.filteredRepayments = this.repayments.filter(
        (repayment: { status: string; }) => repayment.status === 'DUE'
      );
    }
  }

  loadRepaymentSchedule(): void {
    this.repaymentService.getRepaymentSchedule(this.userId).subscribe({
      next: (data) => {
        this.repayments = data;
        this.principalAmt = this.repayments.principalAmount;
        this.InterestRate = this.repayments.interestRate;
        this.period = this.repayments.period;

        if (this.repayments.applicationId === "PL-7840") {
          this.loanType = "Personal Loan";
        } else if (this.repayments.applicationId === "VL-5678") {
          this.loanType = "Vehicle Loan";
        } else {
          this.loanType = "Home Loan";
        }

        this.repayments = this.repayments.tableRepayment;
        this.filteredRepayments = [...this.repayments];
      },
      error: () => {
        this.errorMessage = 'Failed to load repayment schedule. Please try again later.';
        setTimeout(() => (this.errorMessage = null), 3000);
      },
      complete: () => { },
    });
  }


  loadOutstandingBalance(): void {
    this.repaymentService.getOutstandingBalance(this.userId).subscribe({
      next: (data) => {
        this.outstandingBalance = data.outstandingBalance;
      },
      error: () => {
        this.errorMessage = 'Failed to load outstanding balance. Please try again later.';
        setTimeout(() => (this.errorMessage = null), 3000);
      },
      complete: () => { },
    });
  }

  makePayment(repaymentId: number, amountDue: number, userId: string): void {
    this.isPaymentModalVisible = true;
    this.amountDue = amountDue;
    this.repaymentId = repaymentId;
    this.userId = userId;
  }

  onPaymentCompleted(): void {
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
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    doc.setDrawColor(180);
    doc.rect(5, 5, 200, 287, 'S');

    doc.setFontSize(28);
    doc.setFont('times', 'bold');
    doc.setTextColor(25, 25, 112);
    doc.text('Repayment Details', 12, 26);

    doc.setDrawColor(25, 25, 112);
    doc.setLineWidth(1);
    doc.line(12, 28, 110, 28);

    doc.setFontSize(14);
    doc.setTextColor(30, 30, 60);

    let leftY = 38;
    let rightY = 38;
    const leftX = 12;
    const rightX = 115;

    doc.setFont('times', 'bold');
    doc.text('User:', leftX, leftY);
    doc.text('Principal:', rightX, rightY);

    leftY += 8;
    rightY += 8;
    doc.text('Email:', leftX, leftY);
    doc.text('Interest Rate:', rightX, rightY);

    leftY += 8;
    rightY += 8;
    doc.text('Loan Type:', leftX, leftY);
    doc.text('Outstanding Balance:', rightX, rightY);

    leftY += 8;
    doc.text('Period (Monthly):', leftX, leftY);

    doc.setFont('times', 'normal');
    leftY = 38;
    rightY = 38;
    doc.text(`${this.userId.split('@')[0]}`, leftX + 28, leftY);
    doc.text(`Rs ${this.principalAmt.toFixed(2)}`, rightX + 33, rightY);

    leftY += 8;
    rightY += 8;
    doc.text(`${this.userId}`, leftX + 28, leftY);
    doc.text(`${this.InterestRate}%`, rightX + 33, rightY);

    leftY += 8;
    rightY += 8;
    doc.text(`${this.loanType}`, leftX + 28, leftY);
    doc.text(`Rs ${this.outstandingBalance.toFixed(2)}`, rightX + 60, rightY);

    leftY += 8;
    doc.text(`${this.period}`, leftX + 42, leftY);

    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(`Exported: ${new Date().toLocaleString()}`, 12, leftY + 8);

    const headers = [
      'S.NO',
      'Amount Due',
      'Principal',
      'Interest',
      'Balance',
      'Due Date',
      'Payment Date',
      'Status',
    ];
    const columnWidths = [15, 25, 22, 20, 21, 25, 26, 30];
    const startX = 12;
    let startY = leftY + 14;
    const cellHeight = 10;
    const fontSize = 11;

    let headerX = startX;
    doc.setFontSize(fontSize);
    headers.forEach((header, index) => {
      doc.setFillColor(25, 25, 112);
      doc.setTextColor(255, 255, 255);
      doc.rect(headerX, startY, columnWidths[index], cellHeight, 'F');
      doc.text(header, headerX + 2, startY + 7);
      headerX += columnWidths[index];
    });

    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    startY += cellHeight;

    this.filteredRepayments.forEach((repayment: any, rowIndex: number) => {
      if (rowIndex % 2 === 1) {
        let rowX = startX;
        doc.setFillColor(247, 247, 247);
        columnWidths.forEach(w => {
          doc.rect(rowX, startY, w, cellHeight, 'F');
          rowX += w;
        });
      }
      const formatDate = (date: string) => {
        if (!date || date === 'N/A') return 'N/A';
        const parsed = new Date(date);
        if (isNaN(parsed.getTime())) return 'N/A';
        return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
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
      let cellX = startX;
      rowData.forEach((data, colIndex) => {
        if (colIndex === 5) {
          doc.setFont('times', 'bold');
          doc.setTextColor(25, 25, 112);
        } else if (colIndex === 7) {
          doc.setFont('times', 'bold');
          if (data === 'DUE') {
            doc.setTextColor(60, 60, 60);
          } else if (data === 'COMPLETED') {
            doc.setTextColor(34, 139, 34);
          } else {
            doc.setTextColor(0, 0, 0);
          }
        } else {
          doc.setFont('times', 'normal');
          doc.setTextColor(0, 0, 0);
        }
        doc.text(data, cellX + 2, startY + 7);
        cellX += columnWidths[colIndex];
      });
      startY += cellHeight;

      if (startY + cellHeight > doc.internal.pageSize.height - 15) {
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(`Page 1`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 8);
        doc.addPage();
        startY = 10;
      }
    });

    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Page 1`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 8);

    doc.save(`${this.userId.split('@')[0]}_RepaymentDetails.pdf`);
  }
}