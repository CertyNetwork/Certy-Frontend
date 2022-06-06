import { Injectable, TemplateRef } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AppShellService {
  content$ = new Subject<TemplateRef<any>>();
}
