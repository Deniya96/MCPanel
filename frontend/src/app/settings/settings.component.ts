import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  private apiUrl = 'http://localhost:3000';

  serverStartProperties = '';
  serverPath = '';
  customJavaPath = false;
  javaPath = 'java';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.http.get<any>(`${this.apiUrl}/settings`).subscribe({
      next: (config) => {
        this.serverStartProperties = config.serverStartProperties;
        this.serverPath = config.serverPath;
        this.javaPath = config.javaPath;
      },
      error: (err) => console.error('Failed to load settings:', err)
    });
  }

  saveSettings() {
    const config = {
      serverStartProperties: this.serverStartProperties,
      serverPath: this.serverPath,
      javaPath: this.javaPath || 'java'
    };

    this.http.post(`${this.apiUrl}/settings`, config).subscribe({
      next: () => alert('Settings successfully updated!'),
      error: (err) => {
        console.error('Failed to save settings:', err);
        alert('Failed to save settings');
      }
    });
  }
}
