import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    imports: [FormsModule, CommonModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private router: Router){}
  email: string = '';
  password: string = '';
  alertMessage: string = '';
  showAlert: boolean = false;
  isSuccessAlert: boolean = false;

  private validUsers: any = {
    'user1@gmail.com': 'user@123',
    'user2@gmail.com': 'user@234',
    'user3@gmail.com': 'user@345',
  };

  @Output() loginEvent = new EventEmitter<string>(); 

  login() {
    if (this.validUsers[this.email] && this.validUsers[this.email] === this.password) {
      localStorage.setItem('user', this.email); 
      this.alertMessage = 'Login successful!';
      this.isSuccessAlert = true;
      this.showAlert = true;

      setTimeout(() => {
        this.showAlert = false;
        this.loginEvent.emit(this.email);
        this.router.navigate(['/repayment']);
      }, 1500);
      
    } else {
      this.alertMessage = 'Invalid email or password!';
      this.isSuccessAlert = false;
      this.showAlert = true;

      setTimeout(() => {
        this.showAlert = false;
      }, 2000);
    }
  }
}