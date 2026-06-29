import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AtencionPacienteComponent } from './atencion-paciente-component';

describe('AtencionPacienteComponent', () => {
  let component: AtencionPacienteComponent;
  let fixture: ComponentFixture<AtencionPacienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtencionPacienteComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AtencionPacienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});