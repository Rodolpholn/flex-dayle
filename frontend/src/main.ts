import 'zone.js'; // ISSO É ESSENCIAL. Sem isso, a tela não carrega.
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app'; // Aqui ele puxa o arquivo app.ts

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
