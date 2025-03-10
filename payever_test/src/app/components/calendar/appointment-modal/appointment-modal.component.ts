import { Component, Inject } from "@angular/core";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import {
  MatDialogRef,
  MatDialogActions,
  MatDialogClose,
  MatDialogTitle,
  MatDialogContent,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from "@angular/material/form-field";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { Appointment, ToFormControl } from "../calendar.interface";

@Component({
  selector: 'app-appointment-modal-component',
  templateUrl: './appointment-modal.component.html',
  styleUrl: './appointment-modal.component.scss',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatIconModule, MatDialogClose, MatFormFieldModule, MatInputModule, MatAutocompleteModule, ReactiveFormsModule, FormsModule],
})
export class AppointmentModalComponent {

  form: FormGroup<ToFormControl<Appointment>>;
  from: string = '';
  to: string = '';
  title: string = '';
  errMessages: string[] = [];


  constructor(public dialogRef: MatDialogRef<AppointmentModalComponent>, @Inject(MAT_DIALOG_DATA) public data: Appointment) {
    if (data.actionType === 'Add') {
      this.title = 'Add Appointment';
    } else if (data.actionType === 'Edit') {
      this.title = 'Edit Appointment';
    }
    this.form = new FormGroup<ToFormControl<Appointment>>({
      guid: new FormControl(''),
      title: new FormControl('', Validators.required),
      description: new FormControl(''),
      from: new FormControl(new Date(), Validators.required),
      to: new FormControl(new Date(), Validators.required),
    });

    data && this.form.patchValue(data);
    this.from = this.form.value.from!.toLocaleTimeString('en-US', { hour12: false, timeStyle: 'short' });
    this.to = this.form.value.to!.toLocaleTimeString('en-US', { hour12: false, timeStyle: 'short' });

  }

  updateHours(key, val) {
    this[key] = val;
    const date = this.data.from.toISOString().substring(0, 10);
    this.form.patchValue({
      from: new Date(`${date} ${this.from}`),
      to: new Date(`${date} ${this.to}`)
    });
    this.customFormValidation();
  }

  customFormValidation(): void {
    const message: string = 'End time Should be later than start time';
    if (this.form.controls.from.value && this.form.controls.to.value) {
      if (this.form.controls.from.value.getTime() < this.form.controls.to.value.getTime()
        && this.form.controls.from.value.getTime() !== this.form.controls.to.value.getTime()) {

        if (this.errMessages.includes(message)) {
          this.errMessages = this.errMessages.filter(item => { item !== message });
        }
        this.form.controls.from.setErrors({ invalid: null });
        this.form.controls.from.updateValueAndValidity();
        this.form.controls.to.setErrors({ invalid: null });
        this.form.controls.to.updateValueAndValidity();
      }
      else {
        if (!this.errMessages.includes(message)) {
          this.errMessages.push(message);
        }
        this.form.controls.from.setErrors({ invalid: true });
        this.form.controls.to.setErrors({ invalid: true });
      }
    }
  }

  onGlobalInputChanges(): void {
    // this.customFormValidation();
  }

  getValidationMessage(validationErr, ref): string {
    if (validationErr.required) {
      return 'The ' + ref + ' field is required';
    } else {
      return '';
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.value);
  }

}
