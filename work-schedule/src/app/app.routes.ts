import { Routes } from '@angular/router';
import { ScheduleComponent } from './schedule/schedule.component';

export const routes: Routes = [
    { path: 'schedule', component: ScheduleComponent},
    { path: '', redirectTo: '/schedule', pathMatch: 'full'}
];
