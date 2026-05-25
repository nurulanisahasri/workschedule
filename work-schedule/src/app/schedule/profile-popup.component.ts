import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Profile {
  userId?: string;
  name: string;
  email: string;
  role: string;
  location: string;
  bio: string;
  phone: string;
}

const DEFAULT_PROFILE: Profile = {
  userId: 'default-user',
  name: '',
  email: '',
  role: '',
  location: '',
  bio: '',
  phone: '',
};

@Component({
  selector: 'app-profile-popup',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './profile-popup.component.html',
  styleUrls: ['./profile-popup.component.css'],
})
export class ProfilePopupComponent implements OnInit, OnChanges {
  @Input() profile: Profile | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Profile>();

  currentUser: Profile = { ...DEFAULT_PROFILE };
  editingProfile = false;
  profileBackup: Profile | null = null;
  isSavingProfile = false;
  profileMessage = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    if (this.profile) {
      this.currentUser = { ...this.profile };
    } else {
      this.loadUserProfile();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['profile'] && changes['profile'].currentValue) {
      this.currentUser = { ...changes['profile'].currentValue };
    }
  }

  onClose() {
    this.close.emit();
  }

  enterProfileEditMode() {
    this.editingProfile = true;
    this.profileBackup = { ...this.currentUser };
    this.profileMessage = '';
  }

  cancelProfileEdit() {
    this.editingProfile = false;
    if (this.profileBackup) {
      this.currentUser = { ...this.profileBackup };
      this.profileBackup = null;
    }
    this.profileMessage = '';
  }

  loadUserProfile() {
    this.profileMessage = '';

    this.http.get<{ success: boolean; profile: Profile }>('/api/profile').subscribe(
      (response) => {
        if (response?.success && response.profile) {
          this.currentUser = { ...this.currentUser, ...response.profile };
        }
      },
      (error) => {
        console.error('Failed to load profile:', error);
        this.profileMessage = 'Unable to load profile data. Please try again later.';
      }
    );
  }

  saveProfile() {
    this.isSavingProfile = true;
    this.profileMessage = '';

    this.http.post<{ success: boolean; profile: Profile }>('/api/profile', this.currentUser).subscribe(
      (response) => {
        this.isSavingProfile = false;
        if (response?.success && response.profile) {
          this.currentUser = { ...this.currentUser, ...response.profile };
          this.editingProfile = false;
          this.profileBackup = null;
          this.saved.emit(this.currentUser);
          this.profileMessage = 'Profile saved successfully.';
        } else {
          this.profileMessage = 'Unable to save profile at this time.';
        }
      },
      (error) => {
        this.isSavingProfile = false;
        console.error('Failed to save profile:', error);
        this.profileMessage = 'Error saving profile. Please try again.';
      }
    );
  }
}
