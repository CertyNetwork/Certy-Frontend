import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataViewModule } from 'primeng/dataview';
import { CardModule } from 'primeng/card';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { BgCanvasComponent } from './components/bg-canvas/bg-canvas.component';
import { ThemeSwitcherComponent } from './components/theme-switcher/theme-switcher.component';
import { NearLogoComponent } from './components/near-logo/near-logo.component';
import { SideBarComponent } from './components/side-bar/side-bar.component';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { MenuModule } from 'primeng/menu';
import { PanelModule } from 'primeng/panel';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadModule } from 'primeng/fileupload';
import { ToolbarModule } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { EditorModule } from 'primeng/editor';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { PanelMenuModule } from 'primeng/panelmenu';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';
import { ImageModule } from 'primeng/image';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { TreeModule } from 'primeng/tree';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ChipsModule } from 'primeng/chips';
import { DragDropModule } from 'primeng/dragdrop';
import { SkeletonModule } from 'primeng/skeleton';
import { NearLoginComponent } from './components/near-login/near-login.component';
import { CategoryCoverPipe } from './pipes/category-cover.pipe';
import { ImageFallbackDirective } from './directives/image-fallback';
import { CategoryResolver } from './resolvers/category.resolver';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { ProfileCoverPipe } from './pipes/profile-image.pipe';


@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    BgCanvasComponent,
    ThemeSwitcherComponent,
    NearLogoComponent,
    SideBarComponent,
    NearLoginComponent,
    FileUploadComponent,

    // Pipes
    CategoryCoverPipe,
    ProfileCoverPipe,

    //
    ImageFallbackDirective,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataViewModule,
    CardModule,
    ScrollingModule,
    RouterModule,
    ButtonModule,
    ChipModule,
    MenuModule,
    PanelModule,
    InputTextModule,
    InputNumberModule,
    FileUploadModule,
    ToolbarModule,
    AvatarModule,
    EditorModule,
    ConfirmDialogModule,
    DialogModule,
    DynamicDialogModule,
    NgxDropzoneModule,
    PanelMenuModule,
    DividerModule,
    ImageModule,
    DropdownModule,
    CheckboxModule,
    TreeModule,
    TooltipModule,
    ToastModule,
    OverlayPanelModule,
    ChipsModule,
    DragDropModule,
    SkeletonModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataViewModule,
    CardModule,
    ScrollingModule,
    ButtonModule,
    ChipModule,
    MenuModule,
    PanelModule,
    InputTextModule,
    InputNumberModule,
    FileUploadModule,
    ToolbarModule,
    AvatarModule,
    EditorModule,
    ConfirmDialogModule,
    DialogModule,
    DynamicDialogModule,
    NgxDropzoneModule,
    PanelMenuModule,
    DividerModule,
    TableModule,
    ImageModule,
    DropdownModule,
    CheckboxModule,
    TreeModule,
    TooltipModule,
    ToastModule,
    OverlayPanelModule,
    ChipsModule,
    DragDropModule,
    SkeletonModule,

    // Pipes
    CategoryCoverPipe,
    ProfileCoverPipe,

    // Directives
    ImageFallbackDirective,

    // components
    HeaderComponent,
    FooterComponent,
    BgCanvasComponent,
    NearLogoComponent,
    SideBarComponent,
    FileUploadComponent,
  ],
  providers: [
    CategoryResolver
  ],
})
export class SharedModule { }
