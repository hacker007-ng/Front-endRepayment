import { Injectable } from '@angular/core';
import {  Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard{
  constructor(private router: Router) {}

  canActivate(): boolean {
    const isLoggedIn = !!localStorage.getItem('user');
    if (isLoggedIn) {
      this.router.navigate(['/repayment']);
      return false;
    }
    return true;
  }
}