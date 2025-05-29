import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TemaService {
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  darkMode$ = this.darkModeSubject.asObservable();

  constructor() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('darkMode');

    const isDarkMode = savedTheme ? savedTheme === 'true' : prefersDark.matches;
    this.applyTheme(isDarkMode);

    prefersDark.addEventListener('change', (e) => {
      if (!localStorage.getItem('darkMode')) {
        this.applyTheme(e.matches);
      }
    });
  }

  setDarkMode(enabled: boolean) {
    this.applyTheme(enabled);
  }

  private applyTheme(isDark: boolean) {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('darkMode', isDark.toString());
    this.darkModeSubject.next(isDark);
  }

  isDarkMode(): boolean {
    return document.documentElement.classList.contains('dark');
  }
}
