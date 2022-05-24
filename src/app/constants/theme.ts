import { InjectionToken } from "@angular/core";

export const THEMES = new InjectionToken('THEMES');

export interface Theme {
  name: string;
  properties: any;
}