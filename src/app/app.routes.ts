import { Routes } from '@angular/router';
import { About } from './pages/about/about';
import { Minecraft } from './pages/minecraft/minecraft';
import { Airships } from './pages/airships/airships';
import { NeuralNets } from './pages/neural-nets/neural-nets';
import { Consulting } from './pages/consulting/consulting';

export const routes: Routes = [
  { path: '', redirectTo: 'aboutme', pathMatch: 'full' },
  { path: 'aboutme', component: About },
  { path: 'minecraft', component: Minecraft },
  { path: 'airships', component: Airships },
  { path: 'neural-nets', component: NeuralNets },
  { path: 'consulting', component: Consulting },
];
