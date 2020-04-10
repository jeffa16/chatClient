import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { MqttService, IMqttMessage } from 'ngx-mqtt';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { filter, tap } from 'rxjs/operators';
import { MQTT_SERVICE_OPTIONS } from './app.module';
import { UsernameService } from './username.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'chat';
  users = new Set();
  openUsers = new Set();
  filter = "username";
  username = '';
  messages = [];
  showModal = true;
  /*chatForm = new FormGroup({
    textIn: new FormControl('', [Validators.required])
  });*/
  
  usernameForm = new FormGroup({
    usernameInput: new FormControl('', [Validators.required])
  });
  private subscription: Subscription;
  //public message: string;
  constructor(private mqttService: MqttService, private usernameService: UsernameService) {
    this.subscription = this.mqttService.observe("/ECswDNy4/chat/#").pipe(filter( response =>  response.topic.toString().includes(this.username) ), tap( (message) => {
      try {
      this.messages.push( {topic: message.topic.toString(),message: JSON.parse(message.payload.toString())});
    } catch(e) {
      console.log(e)
    }
    
    } )).subscribe((message: IMqttMessage) => {

    });
  }
  ngOnInit(){
    this.usernameService.username$.subscribe( (value) => {this.username = value;})
  }
  closeThread(requestedUser) {
    this.openUsers.delete(requestedUser);
  }
  openThread(requestedUser: string) {
    this.openUsers.add(requestedUser);
  }
  filterUsers(event) {
    this.filter = event;
    if(this.openUsers.has(event)){
      this.openUsers.delete(event);
    }
    else {
      this.openUsers.add(event);
    }
  }
  editUsername() {
    let user = this.usernameForm.get('usernameInput').value;
    this.usernameService.username$.next(user);
    this.unsafePublish('/ECswDNy4/users', user);
  }

  public unsafePublish(topic: string, message: string): void {
    this.mqttService.unsafePublish(topic, message, {qos: 1, retain: true});
  }
}
