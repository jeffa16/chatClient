import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MqttModule, IMqttServiceOptions } from 'ngx-mqtt';
import { ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { TopicFilterPipe } from './topic-filter.pipe';
import { UserWatchComponent } from './user-watch/user-watch.component';
import { ChatThreadComponent } from './chat-thread/chat-thread.component';
import { ConfigModalComponent } from './config-modal/config-modal.component';

export const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  hostname: 'test.mosquitto.org',
  port: 8081,
  path: '/',
  protocol: "wss"
}
@NgModule({
  declarations: [
    AppComponent,
    TopicFilterPipe,
    UserWatchComponent,
    ChatThreadComponent,
    ConfigModalComponent
  ],
  imports: [
    BrowserModule,
    MqttModule.forRoot(MQTT_SERVICE_OPTIONS),
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
