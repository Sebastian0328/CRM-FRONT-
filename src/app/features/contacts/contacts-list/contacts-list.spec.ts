import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactsList } from './contacts-list.component';

describe('ContactsList', () => {
  let component: ContactsList;
  let fixture: ComponentFixture<ContactsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
