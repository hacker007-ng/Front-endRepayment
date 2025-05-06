import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const isLoggedIn = !!localStorage.getItem('user');
    if (isLoggedIn) {
      return true; 
    }
    this.router.navigate(['/']);
    return false;
  }
}