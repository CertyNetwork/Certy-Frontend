import { Injectable } from "@angular/core";
import { AsyncValidator, AbstractControl, ValidationErrors, NG_ASYNC_VALIDATORS } from "@angular/forms";
import { Observable, map, catchError, of } from "rxjs";
import { AuthService } from "../services/auth.service";

@Injectable({
  providedIn: 'root'
})
export class WalletIdValidator implements AsyncValidator {
  constructor(private authService: AuthService) {}

  validate(
    control: AbstractControl
  ): Observable<ValidationErrors | null> {
    return this.authService.checkIfWalletIdNotExists(control.value).pipe(
      map(isNotExist => (isNotExist ? { invalidWalletId: true } : null)),
      catchError(() => of(null))
    );
  }
}