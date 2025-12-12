import { TestBed } from '@angular/core/testing';

import { ActiviesService } from './activies.service';

describe('ActiviesService', () => {
  let service: ActiviesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActiviesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
