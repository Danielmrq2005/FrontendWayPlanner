import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Geolocation, PermissionStatus } from '@capacitor/geolocation';
import { Filesystem } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class PermisosService {
  constructor(private platform: Platform) {}

  async checkLocationPermission(): Promise<boolean> {
    if (this.platform.is('capacitor')) {
      try {
        const status = await Geolocation.checkPermissions();
        return status.location === 'granted';
      } catch (error) {
        console.error('Error checking location permission:', error);
        return false;
      }
    } else {
      return await this.checkWebLocationPermission();
    }
  }

  async requestLocationPermission(): Promise<boolean> {
    if (this.platform.is('capacitor')) {
      try {
        const status = await Geolocation.requestPermissions();
        return status.location === 'granted';
      } catch (error) {
        console.error('Error requesting location permission:', error);
        return false;
      }
    } else {
      try {
        const position = await new Promise<boolean>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve(true),
            () => resolve(false),
            { timeout: 10000 }
          );
        });
        return position;
      } catch (error) {
        console.error('Error requesting web location:', error);
        return false;
      }
    }
  }

  async checkStoragePermission(): Promise<boolean> {
    if (this.platform.is('capacitor')) {
      try {
        const status = await Filesystem.checkPermissions();
        return status.publicStorage === 'granted';
      } catch (error) {
        console.error('Error checking storage permission:', error);
        return true; // Default to true for web
      }
    }
    return true; // Always true for web
  }

  async requestStoragePermission(): Promise<boolean> {
    if (this.platform.is('capacitor')) {
      try {
        const status = await Filesystem.requestPermissions();
        return status.publicStorage === 'granted';
      } catch (error) {
        console.error('Error requesting storage permission:', error);
        return true; // Default to true for web
      }
    }
    return true; // Always true for web
  }

  private async checkWebLocationPermission(): Promise<boolean> {
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        return result.state === 'granted';
      } catch (error) {
        console.error('Error checking web location permission:', error);
        return false;
      }
    }
    return false;
  }

  async savePermissionSettings(type: string, enabled: boolean): Promise<void> {
    await Preferences.set({
      key: `permission_${type}`,
      value: JSON.stringify(enabled)
    });
  }

  async getPermissionSettings(type: string): Promise<boolean> {
    const { value } = await Preferences.get({ key: `permission_${type}` });
    return value ? JSON.parse(value) : false;
  }
}
