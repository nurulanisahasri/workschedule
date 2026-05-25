import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-booking-popup',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './booking-popup.component.html',
  styleUrls: ['./booking-popup.component.css']
})
export class BookingPopupComponent {
  @Input() workspace: any | null = null;
  @Output() close = new EventEmitter<void>();

  bookingForm = {
    date: '',
    time: '',
    duration: 1,
    notes: ''
  };

  constructor(private http: HttpClient) {}

  closePopup() {
    this.close.emit();
  }

  bookNow() {
    if (!this.workspace) {
      return;
    }

    if (!this.bookingForm.date || !this.bookingForm.time) {
      alert('Please fill in all required fields');
      return;
    }

    const bookingData = {
      workspaceId: this.workspace.id,
      workspaceName: this.workspace.name,
      date: this.bookingForm.date,
      time: this.bookingForm.time,
      duration: this.bookingForm.duration,
      notes: this.bookingForm.notes,
      status: 'Confirmed'
    };

    this.http.post('/api/bookWorkspace', bookingData).subscribe(
      () => {
        alert(`✓ Successfully booked ${this.workspace?.name} for ${this.bookingForm.date} at ${this.bookingForm.time}`);
        this.closePopup();
      },
      (error) => {
        console.error('Error booking workspace:', error);
        alert('Failed to book workspace. Please try again.');
      }
    );
  }
}
