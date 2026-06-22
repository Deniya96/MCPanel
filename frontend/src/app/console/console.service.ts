import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConsoleService implements OnDestroy {
  private socket: WebSocket;
  private messages$ = new Subject<string>();
  private readonly apiUrl = 'http://localhost:3000';
  serverStatus: string = 'offline'

  constructor(private http: HttpClient) {
    this.socket = new WebSocket('ws://localhost:3000');
    this.socket.onmessage = (event) => this.messages$.next(event.data);
  }

  getMessages(): Observable<string> {
    return this.messages$.asObservable();
  }

  sendCommand(command: string) {
    this.socket.send(command);
  }

  startServer(): Observable<any> {
    return this.http.post(`${this.apiUrl}/start-server`, {});
  }

  stopServer() {
    this.sendCommand('stop')
  }

  restartServer(): Observable<any> {
    return this.http.post(`${this.apiUrl}/restart-server`, {});
  }

  ngOnDestroy(): void {
    console.log('Closing WebSocket connection');
    this.socket.close();
    this.messages$.complete();
  }

  checkStatus(): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(`${this.apiUrl}/status`);
  }

}

