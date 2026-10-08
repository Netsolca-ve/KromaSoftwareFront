import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Userlayout } from './userlayout';

describe('Userlayout', () => {
  let component: Userlayout;
  let fixture: ComponentFixture<Userlayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Userlayout],
    }).compileComponents();

    fixture = TestBed.createComponent(Userlayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
