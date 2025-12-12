import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DealsList } from './deals-list.component';

describe('DealsList', () => {
  let component: DealsList;
  let fixture: ComponentFixture<DealsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DealsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DealsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
