import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RepaymentComponent } from './repayment/repayment.component';
import { AuthGuard } from './guards/auth.guard';


export const routes: Routes = [
    {
        path: '',
        component: LoginComponent,
    },
    {
        path: 'repayment',
        component: RepaymentComponent,
        canActivate: [AuthGuard]
    },
];