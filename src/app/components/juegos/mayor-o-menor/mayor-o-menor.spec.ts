import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MayorOMenor } from './mayor-o-menor';

describe('MayorOMenor', () => {
  let component: MayorOMenor;
  let fixture: ComponentFixture<MayorOMenor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MayorOMenor],
    }).compileComponents();

    fixture = TestBed.createComponent(MayorOMenor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
