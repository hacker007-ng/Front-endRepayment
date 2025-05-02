import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RepaymentComponent } from "./repayment/repayment.component";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RepaymentComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent  {
  title = 'loan-repayment-app';
}