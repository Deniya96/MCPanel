import {provideRouter, Routes, withRouterConfig } from '@angular/router';
import {ConsoleComponent} from "./console/console.component";
import {SettingsComponent} from "./settings/settings.component";

export const routes: Routes = [
  { path: '', redirectTo: 'console', pathMatch: 'full' },
  { path: 'console', component: ConsoleComponent},
  { path: 'settings', component: SettingsComponent},
];
export const appRouting = provideRouter(routes,
  withRouterConfig({})
);
