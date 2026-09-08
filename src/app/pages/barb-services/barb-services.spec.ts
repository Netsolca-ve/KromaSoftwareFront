import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarbServices } from './barb-services';

describe('BarbServices', () => {
  let component: BarbServices;
  let fixture: ComponentFixture<BarbServices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarbServices],
    }).compileComponents();

    fixture = TestBed.createComponent(BarbServices);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
