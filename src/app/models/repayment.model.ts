// TableRepayment represents each repayment in the repayment schedule
export interface TableRepayment {
    repaymentId?: string;
    month?: number;
    principalRepayment?: number;
    interest?: number;
    outstandingBalance?: number;
    status?: 'PENDING' | 'COMPLETED';
    _id?: string
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
  