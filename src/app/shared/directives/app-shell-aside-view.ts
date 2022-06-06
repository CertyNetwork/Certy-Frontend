import { Directive, OnInit, TemplateRef } from "@angular/core";
import { AppShellService } from "../services/app-shell.service";

@Directive({
  selector: '[appShellAsideView]'
})
export class AppShellAsideView implements OnInit {
  constructor(
    private appShellService: AppShellService,
    private templateRef: TemplateRef<any>
  ) {}
  
  ngOnInit() {
    console.log('next aside');
    this.appShellService.content$.next(this.templateRef);
  }
}