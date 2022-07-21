import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray, AbstractControl } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { map, merge, of, Subject, takeUntil } from 'rxjs';
import { Category } from 'src/app/shared/models/category';
import { CategoryService } from 'src/app/shared/services/category.service';
import { slugify } from 'src/app/shared/utils/string';

@Component({
  selector: 'app-new-category',
  templateUrl: './new-category.component.html',
  styleUrls: ['./new-category.component.scss']
})
export class NewCategoryComponent implements OnInit, OnDestroy {
  categoryForm: FormGroup;
  typeOptions = ['String', 'Number', 'Boolean', 'Media', 'Array'];
  draggedIndex: any;
  changes$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    public categoryService: CategoryService,
    private messageService: MessageService,
  ) {
    this.categoryForm = fb.group({
      info: fb.group({
        title: [null, [Validators.required]],
        description: [null, [Validators.required]],
        cover_image: [null, [Validators.required]],
      }),
      fields: fb.array([this.fb.group({
        label: new FormControl('', [Validators.required]),
        name: new FormControl('', [Validators.required]),
        type: new FormControl('', [Validators.required]),
        mandatory: new FormControl(true, [Validators.required]),
        options: new FormControl(null),
      })])
    });
  }

  ngOnDestroy(): void {
    this.changes$.next();
    this.changes$.complete();
  }

  ngOnInit(): void {
    this.watchForChanges();
  }

  watchForChanges() {
    this.changes$.next();
    merge(...this.fields.controls.map((control: AbstractControl, index: number) => {
      const group = control as FormGroup;
      if (group) {
        return group.get('label')?.valueChanges.pipe(
          takeUntil(this.changes$),
          map(value => ({
            index,
            control,
            value
          }))
        );
      }
      return of(null)
    })).subscribe((val: any) => {
      const { index, value } = val;
      const group = this.fields.at(index) as FormGroup;
      if (group && value) {
        group.get('name')?.setValue(slugify(value))
      }
    })
  };

  get fields() {
    return this.categoryForm.controls["fields"] as FormArray;
  }

  addNewField() {
    this.fields.push(this.fb.group({
      label: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      type: new FormControl('', [Validators.required]),
      mandatory: new FormControl(true, [Validators.required]),
      options: new FormControl(null),
    }));
    this.watchForChanges();
  }

  removeField(index: number) {
    this.fields.removeAt(index);
  }

  get info() {
    return this.categoryForm.get('info') as FormGroup;
  }

  async onSubmit() {
    if (this.info.invalid || this.fields.status === 'INVALID') {
      return;
    }

    const newCategory: Category = {
      title: this.info.value.title,
      description: this.info.value.description,
      raw_image: this.info.value.cover_image[0],
      issued_at: Date.now(),
      last_updated_at: false,

      fields: this.categoryForm.value.fields.map((fd: any) => ({
        name: fd.name,
        label: fd.label,
        data_type: fd.type.toLowerCase(),
        mandatory: fd.mandatory,
        options: fd.options
      })),
    };
    const categoryId = await this.categoryService.addCategory(newCategory);
    if (categoryId) {
      this.messageService.add({
        severity: 'success',
        summary: `New category has been added: ${categoryId}`,
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: `Error while creating category.`,
      });
    }
  }
}
