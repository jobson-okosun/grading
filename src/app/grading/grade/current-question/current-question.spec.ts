import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentQuestion } from './current-question';

describe('CurrentQuestion', () => {
  let component: CurrentQuestion;
  let fixture: ComponentFixture<CurrentQuestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentQuestion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurrentQuestion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
