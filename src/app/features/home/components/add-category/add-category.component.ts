import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Category } from 'src/app/shared/models/category';
import { CategoryService } from 'src/app/shared/services/category.service';
import { moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss']
})
export class AddCategoryComponent implements OnInit {
  step: 'info' | 'field' = 'info';
  categoryForm: FormGroup;
  typeOptions = ['String', 'Number', 'Boolean', 'Media', 'Array'];
  draggedIndex: any;

  constructor(
    private fb: FormBuilder,
    public categoryService: CategoryService,
    private messageService: MessageService,
    private dialogRef: DynamicDialogRef
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

  ngOnInit(): void {
  }

  get fields() {
    return this.categoryForm.controls["fields"] as FormArray;
  }

  addNewField(){
    this.fields.push(this.fb.group({
      label: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      type: new FormControl('', [Validators.required]),
      mandatory: new FormControl(true, [Validators.required]),
      options: new FormControl(null),
    }));
  }

  removeField(index: number) {
    if (this.fields.length === 1) {
      return;
    }
    this.fields.removeAt(index);
  }

  nextStep() {
    const info = this.categoryForm.get('info') as FormGroup;

    if (this.step === 'info' && info.valid) {
      this.step = 'field';
    }
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
      created_at: Date.now(),
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
    this.messageService.add({
      severity: 'success',
      summary: `New category has been added: ${categoryId}`,
    });
    this.dialogRef.close();
  }

  dragStart(event: any, startIndex: any) {
    this.draggedIndex = startIndex;
  }

  dragEnd(event: any) {
    this.draggedIndex = null;
  }

  drop(event: any, dropIndex: any) {
    if (this.draggedIndex && this.draggedIndex !== dropIndex) {
      const fields = this.categoryForm.controls["fields"] as FormArray;
      
      const currentGroup = fields.at(this.draggedIndex);
      fields.removeAt(this.draggedIndex);
      fields.insert(dropIndex, currentGroup);

      this.draggedIndex = null;
    }
  }
}
