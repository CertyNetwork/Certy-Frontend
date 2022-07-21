import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DataView } from 'primeng/dataview';
import { Galleria } from 'primeng/galleria';
import { filter, map, Observable, Subject, switchMap, tap } from 'rxjs';
import { Category } from 'src/app/shared/models/category';
import { CertificateData } from 'src/app/shared/models/certificate-data';
import { CategoryService } from 'src/app/shared/services/category.service';

@Component({
  selector: 'app-category-details',
  templateUrl: './category-details.component.html',
  styleUrls: ['./category-details.component.scss']
})
export class CategoryDetailsComponent implements OnInit, OnDestroy {
  categoryForm: FormGroup;
  typeOptions = ['String', 'Number', 'Boolean', 'Media', 'Array'];
  draggedIndex: any;
  changes$ = new Subject<void>();
  category$: Observable<Category>;
  originCategory?: Category;
  certificates$: Observable<CertificateData[]>;
  isEditing = false;
  isNewCategoryImage = false;
  @ViewChild('dtCerts') dtCerts: DataView | undefined;
  @ViewChild('galleria') galleria: Galleria;
  galleryVisible = false;
  activeIndex = 0;
  galleryOptions = {
    responsiveOptions: [
      {
        breakpoint: '1024px',
        numVisible: 5
      },
      {
        breakpoint: '768px',
        numVisible: 3
      },
      {
        breakpoint: '560px',
        numVisible: 1
      }
    ],
  };
  certImages: any[] = [];

  constructor(
    private activeRoute: ActivatedRoute,
    private fb: FormBuilder,
    public categoryService: CategoryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.categoryForm = this.fb.group({
      title: [null, [Validators.required]],
      description: [null, [Validators.required]],
      media: [null],
    });
    this.category$ = this.activeRoute.data.pipe(
      map(data => data['category'] as Category),
      tap((category: Category) => {
        const { media, ...data} = category;
        this.categoryForm.patchValue(data);
        this.originCategory = category;
      }),
    );
    this.certificates$ = this.category$.pipe(
      filter((cat) => !!cat.id),
      switchMap((cat) => this.categoryService.getCertificates(cat.id || '')),
      tap((certificates) => {
        this.certImages = certificates.map(ct => ({
          previewImageSrc: ct.media,
          thumbnailImageSrc: ct.media,
          alt: ct.description,
          title: ct.title
        }));
      })
    );
  }

  ngOnDestroy(): void {
    this.changes$.next();
    this.changes$.complete();
  }

  ngOnInit(): void {
    //
  }

  beginEditCategory(evt: any) {
    this.isEditing = true;
    setTimeout(() => {
      (this.categoryForm.get('title') as any)?.nativeElement.focus();
    }, 100);
  }

  async onSubmit() {
    if (!this.originCategory || this.categoryForm.invalid) {
      return;
    }

    const updatingCategory: Category = {
      id: this.originCategory.id,
      title: this.categoryForm.value.title,
      description: this.categoryForm.value.description,
      media: this.originCategory.media,
      media_hash: this.originCategory.media_hash,
      raw_image: this.categoryForm.value.media ? this.categoryForm.value.media[0] : null,
      issued_at: Date.now(),
      fields: this.originCategory.fields,
    };
    const categoryId = await this.categoryService.updateCategory(updatingCategory);
    this.messageService.add({
      severity: 'success',
      summary: `The category has been updated: ${categoryId}`,
    });
  }

  filterCerts(query: string) {
    this.dtCerts?.filter(query, 'contains');
  }

  confirmAndUpdateCategory() {
    this.confirmationService.confirm({
      message: `An applicable fee will be charged when updating the category.
      <br>
      <p class="tw-mt-3">Do you want to proceed?</p>`,
      accept: () => {
        this.onSubmit();
      },
      reject: () => {
        this.isEditing = false;
        this.isNewCategoryImage = false;
        this.categoryForm.reset({
          ...this.originCategory,
          media: null
        })
      },
      acceptButtonStyleClass: 'p-button-info',
      rejectButtonStyleClass: 'p-button-secondary mr-5'
    });
  }

  imageClick(index: number) {
    this.activeIndex = index;
    this.galleryVisible = true;
  }

  closeGallery() {
    this.galleryVisible = false;
    if ((this.document as any).exitFullscreen) {
      (this.document as any).exitFullscreen();
    }
    else if ((this.document as any)['mozCancelFullScreen']) {
      (this.document as any)['mozCancelFullScreen']();
    }
    else if ((this.document as any)['webkitExitFullscreen']) {
      (this.document as any)['webkitExitFullscreen']();
    }
    else if ((this.document as any)['msExitFullscreen']) {
      (this.document as any)['msExitFullscreen']();
    }
  }
}
