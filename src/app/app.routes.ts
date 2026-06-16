import { Routes } from '@angular/router';
import { About } from './pages/about/about';
import { Minecraft } from './pages/minecraft/minecraft';

export const routes: Routes = [
  { path: '', redirectTo: 'aboutme', pathMatch: 'full' },
  { path: 'aboutme', component: About },
  { path: 'minecraft', component: Minecraft },
];
