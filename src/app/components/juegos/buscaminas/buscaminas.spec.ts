import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Buscaminas } from './buscaminas';

describe('Buscaminas', () => {
  let component: Buscaminas;
  let fixture: ComponentFixture<Buscaminas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Buscaminas],
    }).compileComponents();

    fixture = TestBed.createComponent(Buscaminas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
