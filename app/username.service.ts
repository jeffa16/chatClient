import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserChange } from './user-change';

@Injectable({
  providedIn: 'root'
})
export class UsernameService {
  username$ = new BehaviorSubject('');
  openUsers$ = new BehaviorSubject<UserChange>({username: '', action: ''});
  constructor() { }


}
