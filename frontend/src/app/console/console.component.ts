import {Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit, OnDestroy} from '@angular/core';
import {ConsoleService} from './console.service';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-console',
  standalone: true,
  templateUrl: './console.component.html',
  styleUrl: './console.component.css',
  imports: [
    FormsModule,
    CommonModule,
  ]
})
export class ConsoleComponent implements OnInit, AfterViewInit, OnDestroy {
  log: string[] = [];
  command: string = '';
  commandHistory: string[] = [];
  historyIndex: number = -1;
  ServerStatus: string = 'offline';
  private statusInterval: any;
  @ViewChild('console', {static: false}) private scrollContainer!: ElementRef;

  constructor(private consoleService: ConsoleService, private cdRef: ChangeDetectorRef) {
  }


  ngOnInit() {
    this.statusInterval = setInterval(() => {
      this.getServerStatus();
    }, 1000);
    this.consoleService.getMessages().subscribe((message) => {
      this.log.push(message);
      this.cdRef.detectChanges();
      this.getServerStatus();
      this.scrollToBottom();
    });
  }

  ngAfterViewInit() {
    this.getServerStatus();
  }

  ngOnDestroy() {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
    }
  }

  private readonly SCROLL_LIMIT: number = 50;

  private scrollToBottom(): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom <= this.SCROLL_LIMIT) {
      container.scrollTo(0, container.scrollHeight);
    }
  }

  getLogClass(line: string): string {
    if (line.includes('ERROR')) return 'log-error';
    if (line.includes('WARN')) return 'log-warn';
    if (line.includes('INFO')) return 'log-info';
    return 'log-default';
  }

  handleCommand() {
    const trimmed = this.command.trim();
    if (!trimmed) return;
    this.commandHistory = this.commandHistory.filter(cmd => cmd !== trimmed);
    this.commandHistory.push(trimmed);
    this.historyIndex = this.commandHistory.length;
    this.sendCommand();
  }

  sendCommand() {
    this.consoleService.sendCommand(this.command);
    this.command = '';
  }

  navigateHistory(direction: 'up' | 'down') {
    if (!this.commandHistory.length) return;

    if (direction === 'up') {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.command = this.commandHistory[this.historyIndex];
      }
    } else if (direction === 'down') {
      if (this.historyIndex < this.commandHistory.length - 1) {
        this.historyIndex++;
        this.command = this.commandHistory[this.historyIndex];
      } else {
        this.historyIndex = this.commandHistory.length;
        this.command = '';
      }
    }
  }

  startServer() {
    this.consoleService.startServer().subscribe({
      next: (res) => console.log('Server started:', res),
      error: (err) => console.error('Error starting server:', err),
    });
  }

  stopServer() {
    this.consoleService.stopServer()
  }

  restartServer() {
    this.consoleService.restartServer().subscribe({
      next: (res) => console.log('Server restarting:', res),
      error: (err) => console.error('Error restarting server:', err),
    })
  }

  getServerStatus() {
    this.consoleService.checkStatus().subscribe((res) => {
      console.log('Server status:', res.status);
      if (res.status === 'online') {
        this.ServerStatus = 'Online';
      } else if (res.status === 'offline') {
        this.ServerStatus = 'Offline';
      } else {
        this.ServerStatus = 'Unknown';
      }

    });
  }
}
