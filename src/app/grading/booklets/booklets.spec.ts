import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Booklets } from './booklets';

describe('Booklets', () => {
  let component: Booklets;
  let fixture: ComponentFixture<Booklets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Booklets]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Booklets);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
