import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Person } from '../person.model';
import { PersonService } from '../person.service';
import { asyncMailExistsValidator } from './asyncMailExistsValidator';

@Component({
  selector: 'app-reactive-validation',
  templateUrl: './reactive-validation.component.html',
  styleUrls: ['./reactive-validation.component.scss'],
})
export class ReactiveValidationComponent implements OnInit {
  person: Person = new Person();
  wealthOpts = ['poor', 'rich', 'middle_class'];

  personForm: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    private ps: PersonService,
    private mailExistsValidator: asyncMailExistsValidator
  ) {}

  ngOnInit() {
    this.loadData();
    this.initForm();
    this.subscribeChanges();
  }

  private loadData() {
    this.ps.getPerson().subscribe((p) => {
      this.personForm.patchValue(p);
    });
  }

  private initForm() {
    this.personForm = this.fb.group({
      name: [
        this.person.name,
        [Validators.required, Validators.minLength(4), this.validateName],
      ],
      age: [this.person.age, [Validators.min(18), Validators.max(99)]],
      gender: [this.person.gender],
      email: [
        this.person.email,
        [Validators.required, Validators.email],
        [this.mailExistsValidator],
        { updateOn: 'blur' },
      ],
      wealth: [this.person.wealth],
    });
  }

  private subscribeChanges() {
    this.personForm.valueChanges.subscribe((vals) => {
      console.log('changes happening @form: ', vals);
    });
  }

  savePerson(personForm: any): void {
    this.ps.save(personForm);
  }

  //Sample for custom sync validator
  validateName(control: UntypedFormControl): { [s: string]: boolean } | null {
    if (control.value === 'Hugo') {
      return { nameError: true };
    }
    return null;
  }

  violatesMinLenght() {
    let result = false;
    let errs: any = this.personForm.controls['name'].errors;

    if (errs != null) {
      console.log('Errors in Name field: ', errs);
      if (errs['minlength']) {
        result = true;
      }
    }
    return result;
  }

  validateForm(form: UntypedFormGroup) {
    // validated single control
    form.controls['name'].updateValueAndValidity();
    // validated form
    form.updateValueAndValidity();
    console.log('form is valid:', form.valid);
  }
}