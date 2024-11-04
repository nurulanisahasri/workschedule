import { RouterModule } from '@angular/router';
import { routes } from './app.routes';  // Import your routes
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    ScheduleComponent
  ],
  imports: [
    RouterModule.forRoot(routes),  // Register your routes here
    FormsModule,
    HttpClientModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
