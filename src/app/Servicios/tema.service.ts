import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class TemaService {
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  darkMode$ = this.darkModeSubject.asObservable();

  constructor(private platform: Platform) {
    this.platform.ready().then(() => {
      // Aplicar tema inmediatamente al inicio
      const savedTheme = localStorage.getItem('darkMode');
      const isDark = savedTheme === 'true';
      this.applyTheme(isDark);

      // Configurar observador de cambios del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      if (savedTheme === null) {
        this.applyTheme(prefersDark.matches);
        prefersDark.addEventListener('change', (e) => {
          if (localStorage.getItem('darkMode') === null) {
            this.applyTheme(e.matches);
          }
        });
      }
    });
  }

  setDarkMode(enabled: boolean) {
    this.applyTheme(enabled);
  }

  private applyTheme(isDark: boolean) {
    // Aplicar clase al elemento html
    document.documentElement.classList.remove('dark');
    if (isDark) {
      document.documentElement.classList.add('dark');
    }

    // Aplicar clase al body también para mayor compatibilidad
    document.body.classList.remove('dark');
    if (isDark) {
      document.body.classList.add('dark');
    }

    // Actualizar variables CSS
    document.documentElement.style.setProperty('--ion-color-primary', isDark ? '#b81763' : '#3880ff');
    document.documentElement.style.setProperty('--ion-background-color', isDark ? '#121212' : '#ffffff');
    document.documentElement.style.setProperty('--ion-text-color', isDark ? '#ffffff' : '#000000');
    document.documentElement.style.setProperty('--ion-toolbar-background', isDark ? '#1f1f1f' : '#f8f8f8');
    document.documentElement.style.setProperty('--ion-item-background', isDark ? '#1e1e1e' : '#ffffff');
    document.documentElement.style.setProperty('--ion-card-background', isDark ? '#1e1e1e' : '#ffffff');

    // Guardar preferencia
    localStorage.setItem('darkMode', isDark.toString());
    this.darkModeSubject.next(isDark);
  }

  isDarkMode(): boolean {
    return document.documentElement.classList.contains('dark');
  }
}
