import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MqttService, IMqttMessage } from 'ngx-mqtt';
import { UsernameService } from '../username.service';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { UserChange } from '../user-change';
import { Subscription } from 'rxjs';
import { filter,tap } from 'rxjs/operators';

@Component({
  selector: 'app-chat-thread',
  templateUrl: './chat-thread.component.html',
  styleUrls: ['./chat-thread.component.css']
})
export class ChatThreadComponent implements OnInit {
  usernames = new Set();
  messages = [];
  @Output() closeThread = new EventEmitter();
  dynamicForm: FormGroup;
  username = '';
  form: FormGroup;
  private subscription: Subscription;
  constructor(private mqttService: MqttService, private usernameService: UsernameService, private fb: FormBuilder) { 
    this.form = this.fb.group({});
    this.subscription = this.mqttService.observe("/ECswDNy4/chat/#").pipe(filter( response =>  response.topic.toString().includes(this.username) ), tap( (message) => {
      try {
      this.messages.push( {topic: message.topic.toString(),message: JSON.parse(message.payload.toString())});
    } catch(e) {
      console.log(e)
    }
    
    } )).subscribe((message: IMqttMessage) => {

    });
  }

  ngOnInit(): void {
    this.usernameService.username$.subscribe( (value) => {this.username = value;})
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
    });
    
  }
  onSubmit(filter: string){
    console.log();
    let messageString = '{"from": "'+this.username+'", "to": "' + filter+ '", "message": "'+ this.form.get(filter).value +'"}';
    this.form.get(filter).setValue('');
    console.log(messageString);
    this.messages.push(JSON.parse('{"message": ' + messageString + '}'));
    this.unsafePublish('/ECswDNy4/chat/' + filter,messageString);
  }
  public unsafePublish(topic: string, message: string): void {
    this.mqttService.unsafePublish(topic, message, {qos: 1, retain: true});
  }
  addUser(username) {
    this.form.addControl(username, this.fb.control(''));
    this.usernames.add(username);
  }
  removeUser(username) {
    this.form.removeControl(username);
    this.usernames.delete(username);
    this.closeThread.emit(username);
  }
  closeButton(filter) {
    this.usernameService.openUsers$.next({username: filter, action: 'remove'});
  }
}
