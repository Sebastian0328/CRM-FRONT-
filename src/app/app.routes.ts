import { Routes } from '@angular/router';
import { CompaniesListComponent } from './features/companies/companies-list/companies-list.component';
import { ContactsList } from './features/contacts/contacts-list/contacts-list.component';
import { ActivitiesListComponent } from "./features/activities/activities-list/activities-list.component";
import { DealsListComponent } from './features/deals/deals-list/deals-list.component';
import { Dashboard } from './features/dashboard/dashboard/dashboard.component';


export const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
 { path: 'dashboard', component: Dashboard},
   { path: 'companies', component: CompaniesListComponent },
  { path: 'contacts', component: ContactsList },
  { path: 'activities', component: ActivitiesListComponent },
  { path: 'deals', component: DealsListComponent},

];

