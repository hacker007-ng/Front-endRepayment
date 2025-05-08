import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RepaymentService } from '../service/repayment.service';

@Component({
    selector: 'app-payment',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './payment.component.html',
    styleUrls: ['./payment.component.css']
})
export class PaymentComponent {
    @Input() repaymentId?: any;
    @Input() userId?: any;
    @Input() amountDue?: number;
    @Output() paymentCompleted = new EventEmitter<number>();
    @Output() paymentCancelled = new EventEmitter<void>();

    constructor(private repaymentService: RepaymentService) { }

    paymentOptions: string[] = ['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Wallet'];
    selectedPaymentOption?: string;
    paymentInProgress = false;
    paymentSuccess = false;


    currentStep: 'selection' | 'details' | 'processing' | 'success'| 'Failed' = 'selection';

    creditCardDetails = { cardholderName: '', cardNumber: '', expiry: '', cvv: '' };
    debitCardDetails = { cardholderName: '', cardNumber: '', expiry: '', cvv: '' };
    upiDetails = { upiId: '' };
    netBankingDetails = { bankName: '' };
    walletDetails = { walletType: '' };

    ngOnChanges(): void {
        if (this.repaymentId) {
            this.resetState();
        }
    }

    selectPaymentOption(option: string): void {
        this.selectedPaymentOption = option;
        this.currentStep = 'details';
    }

    initiatePayment(): void {
        if (this.selectedPaymentOption) {
            this.currentStep = 'processing';
            this.paymentInProgress = true;

            if (this.repaymentId) {
                setTimeout(() => {
                    this.repaymentService.makePayment(this.userId, this.repaymentId).subscribe({
                        next: () => {
                            this.paymentInProgress = false;
                            this.paymentSuccess = true;
                            this.currentStep = 'success';
                            this.paymentCompleted.emit(this.repaymentId);
                        },
                        error: (error) => {
                            this.currentStep = 'Failed';
                            console.error('Payment failed:', error);
                            this.paymentInProgress = false;
                            this.paymentSuccess = false;
                            this.currentStep = 'details';
                            alert('Payment failed. Please try again.');
                        },
                        complete: () => {
                            this.currentStep = 'selection';
                        }
                    });
                }, 5000);
                setTimeout(() => {
                    this.currentStep ="success";
                }, 3000);
            }
        } else {
            alert('Please select a payment option.');
        }
    }

    cancelPayment(): void {
        this.paymentCancelled.emit();
        this.resetState();
    }

    goBackToSelection(): void {
        this.currentStep = 'selection';
        this.selectedPaymentOption = undefined;
        this.paymentSuccess = false;
    }

    getPaymentIcon(option: string): string {
        switch (option) {
            case 'Credit Card':
                return 'bi bi-credit-card';
            case 'Debit Card':
                return 'bi bi-credit-card';
            case 'UPI':
                return 'bi bi-phone';
            case 'Net Banking':
                return 'bi bi-bank';
            case 'Wallet':
                return 'bi bi-wallet';
            default:
                return 'bi bi-credit-card';
        }
    }

    private resetState(): void {
        this.selectedPaymentOption = undefined;
        this.paymentInProgress = false;
        this.paymentSuccess = false;
        this.currentStep = 'selection';
        this.creditCardDetails = { cardholderName: '', cardNumber: '', expiry: '', cvv: '' };
        this.debitCardDetails = { cardholderName: '', cardNumber: '', expiry: '', cvv: '' };
        this.upiDetails = { upiId: '' };
        this.netBankingDetails = { bankName: '' };
        this.walletDetails = { walletType: '' };
    }
}