import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { PacienteService } from './paciente.service';
import { Paciente } from '../models/paciente';
import { environment } from '../../environments/environment';

describe('PacienteService', () => {
  let service: PacienteService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/pacientes`;

  const pacienteMock: Paciente = {
    idUsuario: 1,
    rutUsuario: '12345678-9',
    pnombreUsuario: 'Ana',
    snombreUsuario: 'María',
    apaternoUsuario: 'Pérez',
    amaternoUsuario: 'López',
    emailUsuario: 'ana@ejemplo.cl',
    telefonoUsuario: '+56912345678',
    fechaNacimientoUsuario: '1990-01-15',
    contrasenaUsuario: 'secreto',
    activo: true,
    fechaCreacionUsuario: '2024-06-01',
    idGenero: 1,
    idDireccion: 10,
    idRol: 3
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(PacienteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAll() debe solicitar GET a la URL base de pacientes', () => {
    const respuesta: Paciente[] = [pacienteMock];

    service.getAll().subscribe((lista) => {
      expect(lista).toEqual(respuesta);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(respuesta);
  });

  it('getById() debe solicitar GET con el id en la ruta', () => {
    service.getById(1).subscribe((p) => {
      expect(p).toEqual(pacienteMock);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(pacienteMock);
  });

  it('create() debe solicitar POST con el cuerpo del paciente', () => {
    service.create(pacienteMock).subscribe((p) => {
      expect(p).toEqual(pacienteMock);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(pacienteMock);
    req.flush(pacienteMock);
  });

  it('update() debe solicitar PUT con el id en la ruta y el cuerpo', () => {
    service.update(1, pacienteMock).subscribe((p) => {
      expect(p).toEqual(pacienteMock);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(pacienteMock);
    req.flush(pacienteMock);
  });

  it('delete() debe solicitar DELETE con el id en la ruta', () => {
    service.delete(1).subscribe((body) => {
      expect(body).toBeNull();
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
