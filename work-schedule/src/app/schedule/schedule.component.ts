import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css'],
  standalone : true,
  imports : [FormsModule, CommonModule]
})
export class ScheduleComponent {
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

  searchText: string = '';
  filteredData = this.dataList;

  constructor(private http: HttpClient) {}

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


