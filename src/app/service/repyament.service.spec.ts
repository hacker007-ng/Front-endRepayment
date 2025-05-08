import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RepaymentService } from './repayment.service';
import { TableRepayment } from '../models/repayment.model';

describe('RepaymentService', () => {
  let service: RepaymentService;
  let httpMock: HttpTestingController;

  const apiUrl = 'http://localhost:4000/api/repayments';
  const mockUserId = 'user1@gmail.com';
  const mockRepaymentId = 'A1B2C';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RepaymentService],
    });

    service = TestBed.inject(RepaymentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getRepaymentSchedule', () => {
    it('should fetch repayment schedule for a user', () => {
      const mockRepaymentSchedule: TableRepayment[] = [
        { repaymentId: '1', month: 5000, outstandingBalance: 10000, status: 'DUE', dueDate: '2025-05-30' },
        { repaymentId: '2', month: 3000, outstandingBalance: 7000, status: 'COMPLETED', dueDate: '2025-04-30' },
      ];

      service.getRepaymentSchedule(mockUserId).subscribe((data) => {
        expect(data).toEqual(mockRepaymentSchedule);
      });

      const req = httpMock.expectOne(`${apiUrl}/schedule/${mockUserId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRepaymentSchedule);
    });

    it('should handle errors when fetching repayment schedule', () => {
      service.getRepaymentSchedule(mockUserId).subscribe({
        next: () => fail('Should have failed with 404 error'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
          expect(error.error.message).toBe('Error fetching data');
        }
      });
    
      const req = httpMock.expectOne(`${apiUrl}/schedule/${mockUserId}`);
      expect(req.request.method).toBe('GET');
    });
  });

  describe('makePayment', () => {
    it('should make a payment for a user', () => {
      const mockResponse = { message: 'Payment successful' };

      service.makePayment(mockUserId, mockRepaymentId).subscribe((data) => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/payment/${mockUserId}/${mockRepaymentId}`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should handle errors when making a payment', () => {
      service.makePayment(mockUserId, mockRepaymentId).subscribe({
        next: () => fail('Should have failed with 500 error'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Internal Server Error');
          expect(error.error.message).toBe('Payment failed');
        }
      });
    
      const req = httpMock.expectOne(`${apiUrl}/payment/${mockUserId}/${mockRepaymentId}`);
      expect(req.request.method).toBe('POST');
     
    });
  });

  describe('getOutstandingBalance', () => {
    it('should fetch outstanding balance for a user', () => {
      const mockBalance = { outstandingBalance: 15000 };

      service.getOutstandingBalance(mockUserId).subscribe((data) => {
        expect(data).toEqual(mockBalance);
      });

      const req = httpMock.expectOne(`${apiUrl}/balance/${mockUserId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockBalance);
    });

    it('should handle errors when fetching outstanding balance', () => {
      service.getOutstandingBalance(mockUserId).subscribe({
        next: () => fail('Should have failed with 403 error'),
        error: (error) => {
          expect(error.status).toBe(403);
          expect(error.statusText).toBe('Forbidden');
          expect(error.error.message).toBe('Unauthorized access');
        }
      });
    
      const req = httpMock.expectOne(`${apiUrl}/balance/${mockUserId}`);
      expect(req.request.method).toBe('GET');
    });
  });
});