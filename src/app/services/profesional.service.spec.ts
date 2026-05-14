import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { ProfesionalService } from './profesional.service';
import { Profesional } from '../models/Profesional';
import { environment } from '../../environments/environment';

describe('ProfesionalService', () => {
  let service: ProfesionalService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/profesionales`;

  const profesionalMock: Profesional = {
    idProfesional: 1,
    numeroRegistroProfesional: 'REG-2024-001',
    idUsuario: 5,
    idEspecialidad: 2
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ProfesionalService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAll() debe solicitar GET a la URL base de profesionales', () => {
    const respuesta: Profesional[] = [profesionalMock];

    service.getAll().subscribe((lista) => {
      expect(lista).toEqual(respuesta);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(respuesta);
  });

  it('getById() debe solicitar GET con el id en la ruta', () => {
    service.getById(1).subscribe((p) => {
      expect(p).toEqual(profesionalMock);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(profesionalMock);
  });

  it('create() debe solicitar POST con el cuerpo del profesional', () => {
    service.create(profesionalMock).subscribe((p) => {
      expect(p).toEqual(profesionalMock);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(profesionalMock);
    req.flush(profesionalMock);
  });

  it('update() debe solicitar PUT con el id en la ruta y el cuerpo', () => {
    service.update(1, profesionalMock).subscribe((p) => {
      expect(p).toEqual(profesionalMock);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(profesionalMock);
    req.flush(profesionalMock);
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
