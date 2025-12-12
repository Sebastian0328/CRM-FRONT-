import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivitiesList } from './activities-list.component';

describe('ActivitiesList', () => {
  let component: ActivitiesList;
  let fixture: ComponentFixture<ActivitiesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivitiesList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivitiesList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
