import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScriptService {
  store: Array<any> = [
    { name: 'threejs', src: '/assets/static/threejs/three.min.js' },
    { name: 'tweenmax', src: '/assets/static/threejs/tweenmax.min.js' },
    { name: 'orbitcontrols', src: '/assets/static/threejs/orbitcontrol.js' },
    { name: 'bp-qr-code', src: '/assets/static/qr-code-component-ng/dist/bp-qr-code/bp-qr-code.ew8jtrnq.js', extra: {
      'data-resources-url': "/assets/static/qr-code-component-ng/dist/bp-qr-code/",
      'data-namespace': "bp-qr-code",
    } },
    { name: 'web-animation', src: 'https://unpkg.com/web-animations-js@2.3.1/web-animations.min.js'},
  ];
  private scripts: any = {};

  constructor(
    @Inject(DOCUMENT) private document: Document 
  ) {
    this.store.forEach((script: any) => {
      this.scripts[script.name] = {
        loaded: false,
        src: script.src,
        extra: script.extra,
      };
    });
  }

  load(...scripts: string[]) {
    const promises: any[] = [];
    scripts.forEach((script) => promises.push(this.loadScript(script)));
    return Promise.all(promises);
  }

  remove(...scripts: string[]) {
    const promises: any[] = [];
    scripts.forEach((name) => {
      if (this.scripts[name].loaded) {
        const script = this.document.getElementById(`script_${name}`);
        if (script) {
          script.remove();
        }
      }
    });
  }

  loadScript(name: string, appendBody = 'head') {
    return new Promise((resolve, reject) => {
      if (this.scripts[name].loaded) {
        resolve({ script: name, loaded: true, status: 'Already Loaded' });
      } else {
        const s = this.scripts[name];
        const script: any = this.document.createElement('script') as HTMLScriptElement;
        script.type = 'text/javascript';
        script.src = s.src;
        if (s.extra) {
          for (const k in s.extra) {
            script.setAttribute(k, s.extra[k]);
          }
        }
        if (script.readyState) {
          script.onreadystatechange = () => {
            if (script.readyState === 'loaded' || script.readyState === 'complete') {
              script.onreadystatechange = null;
              s.loaded = true;
              resolve({ script: name, loaded: true, status: 'Loaded' });
            }
          };
        } else {
          script.onload = () => {
            this.scripts[name].loaded = true;
            resolve({ script: name, loaded: true, status: 'Loaded' });
          };
        }
        script.onerror = (error: any) => resolve({ script: name, loaded: false, status: 'Non Loaded' });
        script.id = `script_${name}`;
        const element = this.document.getElementsByTagName(appendBody);
        if(element?.length){
          element[0].appendChild(script);
        }
      }
    });
  }
}
