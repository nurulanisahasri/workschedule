import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ProfilePopupComponent } from './profile-popup.component';
import { BookingPopupComponent } from './booking-popup.component';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css'],
  standalone: true,
  imports: [CommonModule, ProfilePopupComponent, BookingPopupComponent]
})
export class ScheduleComponent {
  navOpen = false;
  profileOpen = false;
  profileModalOpen = false;
  bookingModalOpen = false;
  selectedWorkspace: any = null;

  currentUser = {
    name: 'Nurul',
    email: 'nurul@example.com',
    role: 'Team Member',
    location: 'Jakarta, Indonesia',
    bio: 'Designs smooth workspace experiences with attention to detail.',
    phone: '+62 812 3456 7890'
  };

  dataList = [
    {
      id: 1,
      name: 'John Doe',
      age: 20,
      income: 1000
    }, 
    {
      id: 2,
      name: 'James Foo',
      age: 25,
      income: 3500
    }
  ];

  workspaces = [
    {
      id: 1,
      name: 'Workspace Sky',
      zone: 'Zone 1',
      capacity: 10,
      available: 5,
      price: 50
    },
    {
      id: 2,
      name: 'Workspace Moon',
      zone: 'Zone 2',
      capacity: 8,
      available: 2,
      price: 60
    },
    {
      id: 3,
      name: 'Workspace Venus',
      zone: 'Zone 3',
      capacity: 12,
      available: 8,
      price: 45
    }
  ];

  searchText: string = '';
  filteredData = this.dataList;

  constructor(private http: HttpClient) {}

  toggleNav() {
    this.navOpen = !this.navOpen;
  }

  toggleProfile() {
    this.profileOpen = !this.profileOpen;
  }

  openProfileModal() {
    this.profileModalOpen = true;
    this.profileOpen = false;
  }

  closeProfileModal() {
    this.profileModalOpen = false;
  }

  updateCurrentUser(profile: any) {
    this.currentUser = { ...this.currentUser, ...profile };
  }

  openBookingModal(workspace: any) {
    this.selectedWorkspace = workspace;
    this.bookingModalOpen = true;
  }

  closeBookingModal() {
    this.bookingModalOpen = false;
    this.selectedWorkspace = null;
  }

  applyCreditCard(id: number) {
    console.log("Applying for card for user with ID:", id);

    const apiUrl = '/api/applyCard';
    const payload = { userId: id };

    this.http.post(apiUrl, payload).subscribe(
      response => {
        console.log(`Card application successful for user with ID: ${id}`);
        alert(`Card application submitted for user with ID: ${id}`);
      },
      error => {
        console.error(`Error applying for card for user with ID: ${id}`, error);
        alert(`Failed to apply for card for user with ID: ${id}`);
      }
    );
  }

  filterTable() {
    if (this.searchText.trim() === '') {
      this.filteredData = this.dataList;
    } else {
      this.filteredData = this.dataList.filter(data => 
        data.name.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }
  }
}


