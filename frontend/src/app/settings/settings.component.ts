import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  serverStartProperties = '-Dfile.encoding=UTF-8 -Xmx8G -jar server.jar -nogui';
  serverPath = '';
  customJavaPath = false;
  javaPath = 'java';

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    const savedServerStartProperties = localStorage.getItem('serverStartProperties');
    if (savedServerStartProperties !== null) this.serverStartProperties = savedServerStartProperties;

    const savedServerPath = localStorage.getItem('serverPath');
    if (savedServerPath !== null) this.serverPath = savedServerPath;

    const savedCustomJavaPath = localStorage.getItem('customJavaPath');
    if (savedCustomJavaPath !== null) this.customJavaPath = savedCustomJavaPath === 'true';

    const savedJavaPath = localStorage.getItem('javaPath');
    if (savedJavaPath !== null) this.javaPath = savedJavaPath;
  }

  saveSettings() {
    console.log('Settings saved:', {
      serverStartProperties: this.serverStartProperties,
      serverPath: this.serverPath,
      customJavaPath: this.customJavaPath,
      javaPath: this.javaPath
    });
    localStorage.setItem('serverStartProperties', this.serverStartProperties);
    localStorage.setItem('serverPath', this.serverPath);
    localStorage.setItem('customJavaPath', String(this.customJavaPath));
    localStorage.setItem('javaPath', this.javaPath);
    alert('Settings successfully updated!');
  }
}
