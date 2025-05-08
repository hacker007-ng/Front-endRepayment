
export interface TableRepayment {
    repaymentId?: string;
    month?: number;
    principalRepayment?: number;
    interest?: number;
    outstandingBalance?: number;
    status?: 'COMPLETED' | 'DUE';
    _id?: string,
    dueDate?: Date | string
  }
  
 
  export interface Repayment {
    _id?: string;
    userId?: string;
    applicationId?: string;
    principalAmount?: number;
    period?: number;
    interestRate?: number;
    tableRepayment?: TableRepayment[];
  }
  