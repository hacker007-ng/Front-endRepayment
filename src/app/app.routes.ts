import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RepaymentComponent } from './repayment/repayment.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';
import { PaymentComponent } from './payment/payment.component';

export const routes: Routes = [
    {
        path: '',
        component: LoginComponent,
        canActivate: [LoginGuard]
    },
    {
        path: 'repayment',
        component: RepaymentComponent,
        canActivate: [AuthGuard]
    },
];