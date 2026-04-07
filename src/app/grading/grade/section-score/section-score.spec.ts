import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionScore } from './section-score';

describe('SectionScore', () => {
  let component: SectionScore;
  let fixture: ComponentFixture<SectionScore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionScore]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionScore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
