import { TestBed } from '@angular/core/testing';

import { Jira } from './jira';

describe('Jira', () => {
  let service: Jira;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Jira);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
