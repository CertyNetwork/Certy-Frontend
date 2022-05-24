import { DOCUMENT } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ScriptService } from '../../services/script.service';
import { ThemeService } from '../../services/theme.service';

const radius = 80;

@Component({
  selector: 'app-bg-canvas',
  templateUrl: './bg-canvas.component.html',
  styleUrls: ['./bg-canvas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BgCanvasComponent implements OnInit, AfterViewInit, OnDestroy {
  // ThreeJs
  THREE: any;
  canvas: any;
  scene: any;
  camera: any;
  particles: any;
  renderer: any;
  config = {
    SEPARATION: 80,
    AMOUNTX: 40,
    AMOUNTY: 40
  };
  count =  0;
  subs = new Subscription();

  constructor(
    private scriptService: ScriptService,
    private themeSvc: ThemeService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnDestroy(): void {
    this.cleanObjects();
    this.cleanScene();
    this.scriptService.remove('threejs', 'tweenmax');
    this.subs.unsubscribe();
  }

  private cleanScene(): void {
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private cleanObjects(): void {
    //
  }

  ngOnInit(): void {
    this.subs.add(this.themeSvc.theme$.subscribe(theme => {
      if (this.renderer) {
        this.renderer.setClearColor(theme === 'light' ? 0xf5f5f5 : 0x060d13);
      }
    }));
  }

  ngAfterViewInit() {
    this.initThreeJs();
  }

  private initThreeJs() {
    this.scriptService.load('threejs', 'tweenmax').then(() => {
      this.canvas = this.document.querySelector('#scene') as HTMLCanvasElement;
      const width = this.canvas.offsetWidth;
      const height = this.canvas.offsetHeight;
      this.THREE = (window as any).THREE;
      this.scene = new this.THREE.Scene();
      this.camera = new this.THREE.PerspectiveCamera(75, width / height, 100, 1000);
      this.camera.position.x = 300;
      this.camera.position.y = 400;
      this.camera.position.z = 50;
      this.camera.lookAt(this.scene.position);

      const numParticles = this.config.AMOUNTX * this.config.AMOUNTY;
      const positions = new Float32Array( numParticles * 3 );
      const scales = new Float32Array( numParticles );

      let i = 0, j = 0;

      for ( let ix = 0; ix < this.config.AMOUNTX; ix ++ ) {

        for ( let iy = 0; iy < this.config.AMOUNTY; iy ++ ) {

          positions[ i ] = ix * this.config.SEPARATION - ( ( this.config.AMOUNTX * this.config.SEPARATION ) / 2 ); // x
          positions[ i + 1 ] = 0; // y
          positions[ i + 2 ] = iy * this.config.SEPARATION - ( ( this.config.AMOUNTY * this.config.SEPARATION ) / 2 ); // z

          scales[ j ] = 1;

          i += 3;
          j ++;

        }

      }

      const geometry = new this.THREE.BufferGeometry();
      geometry.addAttribute( 'position', new this.THREE.BufferAttribute( positions, 3 ) );
      geometry.addAttribute( 'scale', new this.THREE.BufferAttribute( scales, 1 ) );

      const material = new this.THREE.ShaderMaterial( {
        uniforms: {
          color: { value: new this.THREE.Color( 0xfaab67 ) },
        },
        vertexShader: "attribute float scale;\n\nvoid main() {\n\n\tvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n\n\tgl_PointSize = scale * ( 300.0 / - mvPosition.z );\n\n\tgl_Position = projectionMatrix * mvPosition;\n\n}",
        fragmentShader: "uniform vec3 color;\n\nvoid main() {\n\n\tif ( length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.475 ) discard;\n\n\tgl_FragColor = vec4( color, 1.0 );\n\n}"
      } );

      //

      this.particles = new this.THREE.Points( geometry, material );
      this.scene.add( this.particles );

      //

      this.renderer = new this.THREE.WebGLRenderer( { canvas: this.canvas, antialias: true } );
      this.renderer.setPixelRatio( window.devicePixelRatio );
      this.renderer.setSize(width, height);
      this.renderer.setClearColor( this.themeSvc.getCurrentTheme() === 'light' ? 0xf5f5f5 : 0x060d13);

      (window as any).TweenMax.ticker.addEventListener("tick", this.animate.bind(this));
    });
  }

  animate() {
    window.requestAnimationFrame(() => this.animate);
    this.render();
  }
  
  render() {

    const positions = this.particles.geometry.attributes.position.array;
    const scales = this.particles.geometry.attributes.scale.array;

    let i = 0, j = 0;

    for ( let ix = 0; ix < this.config.AMOUNTX; ix ++ ) {

      for ( let iy = 0; iy < this.config.AMOUNTY; iy ++ ) {

        positions[ i + 1 ] = ( Math.sin( ( ix + this.count ) * 0.3 ) * 50 ) +
                ( Math.sin( ( iy + this.count ) * 0.5 ) * 50 );

        scales[ j ] = ( Math.sin( ( ix + this.count ) * 0.3 ) + 1 ) * 10 +
                ( Math.sin( ( iy + this.count ) * 0.5 ) + 1 ) * 10;

        i += 3;
        j ++;

      }

    }

    this.particles.geometry.attributes.position.needsUpdate = true;
    this.particles.geometry.attributes.scale.needsUpdate = true;

    this.renderer.render( this.scene, this.camera );

    this.count += 0.1;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.canvas.style.width = '';
    this.canvas.style.height = '';
    const width = this.canvas.offsetWidth;
    const height = this.canvas.offsetHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();  
    this.renderer.setSize(width, height);
  }
}
