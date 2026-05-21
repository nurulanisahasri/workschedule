import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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
  name: 'Nurul',
  email: 'nurul@example.com',
  role: 'Team Member',
  location: 'Jakarta, Indonesia',
  bio: 'Designs smooth workspace experiences with attention to detail.',
  phone: '+62 812 3456 7890',
};

@Component({
  selector: 'app-profile-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>My Profile</h3>
          <button class="close-btn" (click)="onClose()" aria-label="Close modal">×</button>
        </div>

        <div class="modal-body">
          <div class="profile-modal-header">
            <div>
              <h4>Profile Summary</h4>
              <p>View your profile details and edit them when needed.</p>
            </div>
            <button type="button" class="btn-edit-profile" *ngIf="!editingProfile" (click)="enterProfileEditMode()">
              ✎ Edit
            </button>
          </div>

          <div *ngIf="!editingProfile">
            <div class="profile-details">
              <div class="profile-avatar">
                <img src="https://i.pravatar.cc/100" alt="User avatar">
              </div>
              <div class="profile-info">
                <h4>{{ currentUser.name }}</h4>
                <p>{{ currentUser.role }}</p>
                <p>{{ currentUser.location }}</p>
                <p>{{ currentUser.email }}</p>
                <p>{{ currentUser.phone }}</p>
              </div>
            </div>
            <div class="profile-bio">
              <h4>About</h4>
              <p>{{ currentUser.bio }}</p>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-cancel" (click)="onClose()">Close</button>
            </div>
          </div>

          <form *ngIf="editingProfile" (ngSubmit)="saveProfile()">
            <div class="profile-details edit-view">
              <div class="profile-avatar">
                <img src="https://i.pravatar.cc/100" alt="User avatar">
              </div>
              <div class="profile-info">
                <h4>Edit profile</h4>
                <p>Update the fields below and save your changes.</p>
              </div>
            </div>
            <div class="form-group">
              <label for="name">Name</label>
              <input id="name" name="name" type="text" [(ngModel)]="currentUser.name" required>
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input id="email" name="email" type="email" [(ngModel)]="currentUser.email" required>
            </div>
            <div class="form-group">
              <label for="role">Role</label>
              <input id="role" name="role" type="text" [(ngModel)]="currentUser.role">
            </div>
            <div class="form-group">
              <label for="location">Location</label>
              <input id="location" name="location" type="text" [(ngModel)]="currentUser.location">
            </div>
            <div class="form-group">
              <label for="phone">Phone</label>
              <input id="phone" name="phone" type="tel" [(ngModel)]="currentUser.phone">
            </div>
            <div class="form-group">
              <label for="bio">About</label>
              <textarea id="bio" name="bio" [(ngModel)]="currentUser.bio"></textarea>
            </div>
            <div class="profile-bio" *ngIf="profileMessage">
              <p>{{ profileMessage }}</p>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-cancel" (click)="cancelProfileEdit()">Cancel</button>
              <button type="submit" class="btn-confirm" [disabled]="isSavingProfile">
                {{ isSavingProfile ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(15, 23, 42, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.2s ease;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .modal-content {
        background: #ffffff;
        border-radius: 24px;
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(15, 23, 42, 0.15);
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .modal-header h3 {
        margin: 0;
        font-size: 1.25rem;
        color: #111827;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 2rem;
        color: #6b7280;
        cursor: pointer;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        transition: all 0.2s ease;
      }

      .close-btn:hover {
        background: #f3f4f6;
        color: #111827;
      }

      .modal-body {
        padding: 1.5rem;
      }

      .profile-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .profile-modal-header h4 {
        margin: 0 0 0.25rem;
        font-size: 1.1rem;
      }

      .profile-modal-header p {
        margin: 0;
        color: #6b7280;
        font-size: 0.95rem;
      }

      .btn-edit-profile {
        align-self: center;
        background: #f7c6d3;
        color: #111827;
        border: none;
        border-radius: 12px;
        padding: 0.75rem 1rem;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
      }

      .btn-edit-profile:hover {
        transform: translateY(-1px);
        box-shadow: 0 10px 18px rgba(247, 158, 190, 0.25);
      }

      .profile-details {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .edit-view .profile-info h4 {
        margin: 0;
        font-size: 1.25rem;
      }

      .profile-avatar {
        flex-shrink: 0;
        width: 90px;
        height: 90px;
        border-radius: 9999px;
        overflow: hidden;
        border: 2px solid #f7c6d3;
      }

      .profile-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .profile-info h4 {
        margin: 0 0 0.25rem;
        font-size: 1.25rem;
      }

      .profile-info p {
        margin: 0.25rem 0;
        color: #6b7280;
      }

      .profile-bio {
        margin-bottom: 1.5rem;
      }

      .profile-bio h4 {
        margin: 0 0 0.75rem;
        font-size: 1rem;
        color: #111827;
      }

      .profile-bio p {
        margin: 0;
        color: #4b5563;
        line-height: 1.7;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #111827;
        font-size: 0.95rem;
      }

      .form-group input,
      .form-group textarea {
        width: 100%;
        padding: 0.9rem 1rem;
        border: 1px solid #d1d5db;
        border-radius: 12px;
        font-size: 0.95rem;
        font-family: 'Poppins', sans-serif;
        transition: all 0.2s ease;
      }

      .form-group input:focus,
      .form-group textarea:focus {
        outline: none;
        border-color: #f7c6d3;
        box-shadow: 0 0 0 3px rgba(247, 176, 188, 0.25);
      }

      .form-group textarea {
        resize: vertical;
        min-height: 100px;
      }

      .modal-actions {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
      }

      .btn-cancel,
      .btn-confirm {
        flex: 1;
        padding: 0.9rem 1.2rem;
        border: none;
        border-radius: 12px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-cancel {
        background: #e5e7eb;
        color: #111827;
      }

      .btn-cancel:hover {
        background: #d1d5db;
      }

      .btn-confirm {
        background: linear-gradient(135deg, #f7c6d3 0%, #f2a9bf 100%);
        color: #ffffff;
      }

      .btn-confirm:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 24px rgba(247, 158, 190, 0.3);
      }

      @media (max-width: 768px) {
        .profile-details {
          flex-direction: column;
          align-items: stretch;
        }

        .modal-content {
          width: 95%;
        }

        .modal-actions {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class ProfilePopupComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Profile>();

  currentUser: Profile = { ...DEFAULT_PROFILE };
  editingProfile = false;
  profileBackup: Profile | null = null;
  isSavingProfile = false;
  profileMessage = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUserProfile();
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
