import { Pipe, PipeTransform } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { UserService } from '../services/user.service';

@Pipe({ name: 'profileCover' })
export class ProfileCoverPipe implements PipeTransform {
  constructor(
    private userService: UserService
  ) {}

  transform(accountId: string, ...args: any[]): Observable<string> {
    if (!accountId) {
      return of('');
    }
    return from(this.userService.getAvatarUrl(accountId));
  }
}