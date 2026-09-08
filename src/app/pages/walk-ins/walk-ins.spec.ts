import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WalkIns } from './walk-ins';

describe('WalkIns', () => {
  let component: WalkIns;
  let fixture: ComponentFixture<WalkIns>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalkIns],
    }).compileComponents();

    fixture = TestBed.createComponent(WalkIns);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
