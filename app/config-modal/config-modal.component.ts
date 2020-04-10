import { Component, OnInit, ElementRef, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UsernameService } from '../username.service';
import { MqttService } from 'ngx-mqtt';

@Component({
  selector: 'app-config-modal',
  templateUrl: './config-modal.component.html',
  styleUrls: ['./config-modal.component.css']
})
export class ConfigModalComponent implements OnInit {
  @Output() dismiss = new EventEmitter();
  usernameForm = new FormGroup({
    usernameInput: new FormControl('', [Validators.required])
  });


  constructor(private el: ElementRef, private usernameService: UsernameService,private mqttService: MqttService) { }

  ngOnInit(): void {
    document.body.appendChild(this.el.nativeElement)
  }
  ngOnDestroy(): void {
    this.el.nativeElement.remove();
  }

  onDismissClick() {
    this.dismiss.emit();
  }
  editUsername() {
    let user = this.usernameForm.get('usernameInput').value;
    this.usernameService.username$.next(user);
    this.unsafePublish('/ECswDNy4/users', user);
    this.dismiss.emit();
  }
  public unsafePublish(topic: string, message: string): void {
    this.mqttService.unsafePublish(topic, message, {qos: 1, retain: true});
  }
}
