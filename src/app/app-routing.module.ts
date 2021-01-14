import { ExtraOptions, RouterModule, Routes, UrlSerializer } from '@angular/router';
import { NgModule } from '@angular/core';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './notfoundpage/notfound.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'notfound',
    component: NotFoundComponent,
  },
  {
    path: 'pages',
    loadChildren: () => import('./pages/pages.module')
      .then(m => m.PagesModule),
  },
  {
    path: '',
    loadChildren: () => import('./accounts/accounts.module')
      .then(m => m.AccountsModule),
  },
  {
    path: '',
    loadChildren: () => import('./masterpage/masterpage.module')
      .then(m => m.MasterPageModule),
  },
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: '**', redirectTo: 'notfound' },

];

const config: ExtraOptions = {
  useHash: false,
  malformedUriErrorHandler:
    // redirects the user to `/invalid-uri`
    (error: URIError, urlSerializer: UrlSerializer, url: string) => urlSerializer.parse('/notfound'),
};

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}


// function parseUrl(url: string): UrlTree {
//   let urlTree: UrlTree;
//   try {
//     urlTree = this.urlSerializer.parse(url);
//   } catch (e) {
//     urlTree = this.malformedUriErrorHandler(e, this.urlSerializer, url);
//   }
//   return urlTree;
// }
