import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SpinnerService {

  private loadingSource = new BehaviorSubject<boolean>(false);
  public loadingStatus$ = this.loadingSource.asObservable();

  constructor() { }

  public show() {
    this.loadingSource.next(true);
  }

  public hide() {
    this.loadingSource.next(false);
  }

}