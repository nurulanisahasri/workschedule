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
    endTime: '',
    notes: ''
  };

  hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  timeHour = '';
  timeMinute = '';
  endTimeHour = '';
  endTimeMinute = '';

  constructor(private http: HttpClient) {}

  closePopup() {
    this.close.emit();
  }

get totalPrice(): number {
  return this.durationInHours * 5;
}

get durationInHours(): number {
  if (!this.bookingForm.time || !this.bookingForm.endTime) return 0;

  const start = this.convertToMinutes(this.bookingForm.time);
  const end = this.convertToMinutes(this.bookingForm.endTime);

  if (end <= start) return 0;

  return (end - start) / 60;
}

convertToMinutes(time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}


fixTime(field: 'time' | 'endTime') {
  let time = this.bookingForm[field];
  if (!time) return;

  let [hour, minute] = time.split(':').map(Number);

  // ✅ Force only 00 or 30 minute slots
  if (minute < 15) {
    minute = 0;
  } else if (minute < 45) {
    minute = 30;
  } else {
    minute = 0;
    hour = (hour + 1) % 24;
  }

  const formatted =
    String(hour).padStart(2, '0') + ':' +
    String(minute).padStart(2, '0');

  this.bookingForm[field] = formatted;
}

updateTimeFromSelects(field: 'time' | 'endTime') {
  if (field === 'time') {
    if (this.timeHour && this.timeMinute) {
      this.bookingForm.time = `${this.timeHour}:${this.timeMinute}`;
    }
  } else if (field === 'endTime') {
    if (this.endTimeHour && this.endTimeMinute) {
      this.bookingForm.endTime = `${this.endTimeHour}:${this.endTimeMinute}`;
    }
  }
}

  bookNow() {
    if (!this.workspace) {
      alert('Workspace information is missing');
      return;
    }

    if (!this.bookingForm.date) {
      alert('Please select a date');
      return;
    }

    if (!this.timeHour || !this.timeMinute) {
      alert('Please select a start time');
      return;
    }

    if (!this.endTimeHour || !this.endTimeMinute) {
      alert('Please select an end time');
      return;
    }

    // Ensure time values are set from selects
    this.bookingForm.time = `${this.timeHour}:${this.timeMinute}`;
    this.bookingForm.endTime = `${this.endTimeHour}:${this.endTimeMinute}`;

    if (this.durationInHours <= 0) {
      alert('End time must be later than start time');
      return;
    }

    const bookingData = {
      workspaceId: this.workspace.id,
      workspaceName: this.workspace.name,
      date: this.bookingForm.date,
      time: this.bookingForm.time,
      endTime: this.bookingForm.endTime,
      duration: this.durationInHours,
      notes: this.bookingForm.notes,
      price: this.totalPrice,
      status: 'Confirmed'
    };

    console.log('Sending booking data:', bookingData);

    this.http.post('/api/bookWorkspace', bookingData).subscribe(
      (response: any) => {
        console.log('Booking response:', response);
        alert(`✓ Successfully booked ${this.workspace?.name} for ${this.bookingForm.date} at ${this.bookingForm.time}`);
        this.closePopup();
      },
      (error: any) => {
        console.error('Error booking workspace:', error);
        const errorMessage = error?.error?.message || 'Failed to book workspace. Please try again.';
        alert(errorMessage);
      }
    );
  }
}
