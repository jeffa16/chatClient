import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { MqttService, IMqttMessage } from 'ngx-mqtt';
import { Subscription } from 'rxjs';
import { UserChange } from '../user-change';
import { UsernameService } from '../username.service';
import { filter, tap } from 'rxjs/operators';

@Component({
  selector: 'app-user-watch',
  templateUrl: './user-watch.component.html',
  styleUrls: ['./user-watch.component.css']
})
export class UserWatchComponent implements OnInit {
  private subscription: Subscription;
  constructor(private mqttService: MqttService, private usernameService: UsernameService) {
    navigator.serviceWorker.register('sw.js');
   }
  users = new Set();
  username = '';
  openUsers = new Set();
  filter = '';
  messageQueue = {};
  @Output() selectedUser = new EventEmitter();
  ngOnInit(): void {
    //Watches the users topic to find out when new users appear
    this.subscription = this.mqttService.observe("/ECswDNy4/users").subscribe((message: IMqttMessage) => {
      console.log(message);
      this.users.add(message.payload.toString());
    });
    //Watches messages to find when messages arrive that do not have a chat box open
    //Increment the number by one if it exists
    this.usernameService.username$.subscribe( user => {this.username = user;});
    this.subscription = this.mqttService.observe("/ECswDNy4/chat/#").pipe(filter( response =>  response.topic.toString().includes(this.username) ), tap( (message) => {
      try {
        let jsonObject = JSON.parse(message.payload.toString());
        console.log(jsonObject);
      if(!this.openUsers.has(jsonObject.from) ){
        if(this.messageQueue[jsonObject.from]){
          this.messageQueue[jsonObject.from] +=1;
          this.notifyMe(jsonObject.message);
        }
        else if(this.username != '') {
          this.messageQueue[jsonObject.from] =1;
          this.showNotification(jsonObject.message);
        }
        if(!this.users.has(jsonObject.from)) {
          this.users.add(jsonObject.from);
        }
      }
    } catch(e) {
      console.log(e)
    }
  })).subscribe();
    
    this.usernameService.openUsers$.subscribe( (value) => {
      console.log(value)
      if(value.action == "remove") {
        this.removeUser(value.username)
      }
      else if(value.action == "add")
      {
        this.addUser(value.username)
        console.log("Chat thread adding " + value.username)
      }
    })
  }
  addUser(username) {
    this.openUsers.add(username);
    this.messageQueue[username] = 0;
  }
  removeUser(username) {
    this.openUsers.delete(username);
  }
 
  filterUsers(user: string) {
    //this.selectedUser.emit(user);
    if(this.openUsers.has(user)){
      this.openUsers.delete(user);
      this.usernameService.openUsers$.next({username: user, action: 'remove'});
    }
    else {
      this.openUsers.add(user);
      this.usernameService.openUsers$.next({username: user, action: 'add'})
    }
  }
  notifyMe(message: string) {
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
    }
  
    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === "granted") {
      // If it's okay let's create a notification
      var notification = new Notification(message);
    }
  
    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(function (permission) {
        // If the user accepts, let's create a notification
        if (permission === "granted") {
          var notification = new Notification(message);
        }
      });
    }
  
    // At last, if the user has denied notifications, and you 
    // want to be respectful there is no need to bother them any more.
  }
  showNotification(message: string) {
    Notification.requestPermission(function(result) {
      if (result === 'granted') {
        navigator.serviceWorker.ready.then(function(registration) {
          registration.showNotification(message, {
            vibrate: [200, 100, 200, 100, 200, 100, 200],
            tag: ''
          });
        });
      }
    });
  }
}
