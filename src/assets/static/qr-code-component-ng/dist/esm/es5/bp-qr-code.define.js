
// BpQrCode: Custom Elements Define Library, ES Module/es5 Target

import { defineCustomElement } from './bp-qr-code.core.js';
import {
  BpQRCode
} from './bp-qr-code.components.js';

export function defineCustomElements(win, opts) {
  return defineCustomElement(win, [
    BpQRCode
  ], opts);
}
