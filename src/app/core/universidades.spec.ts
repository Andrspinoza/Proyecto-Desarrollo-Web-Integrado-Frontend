import { CARRERAS, correoEsDeLaUniversidad, metaUniversidad } from './universidades';

describe('universidades', () => {
  it('conoce las diez universidades de la red por su dominio', () => {
    const dominios = ['utp.edu.pe', 'upc.edu.pe', 'utec.edu.pe', 'aloe.ulima.edu.pe', 'usil.pe', 'upn.edu.pe', 'pucp.edu.pe', 'ucvvirtual.edu.pe', 'unmsm.edu.pe', 'uwiener.edu.pe'];
    const siglas = dominios.map((d) => metaUniversidad(d).sigla);

    expect(siglas).toEqual(['UTP', 'UPC', 'UTEC', 'ULIMA', 'USIL', 'UPN', 'PUCP', 'UCV', 'UNMSM', 'UNW']);
  });

  it('usa una insignia genérica con las iniciales para un dominio desconocido', () => {
    const meta = metaUniversidad('unalm.edu.pe');

    expect(meta.sigla).toBe('UNALM');
    expect(meta.sedes).toEqual([]);
  });

  it('cada universidad conocida tiene su logo y la genérica no', () => {
    for (const dominio of ['utp.edu.pe', 'upc.edu.pe', 'utec.edu.pe', 'aloe.ulima.edu.pe', 'usil.pe', 'upn.edu.pe', 'pucp.edu.pe', 'ucvvirtual.edu.pe', 'unmsm.edu.pe', 'uwiener.edu.pe']) {
      expect(metaUniversidad(dominio).logo).toMatch(/^universidades\//);
    }
    expect(metaUniversidad('unalm.edu.pe').logo).toBeNull();
  });

  it('no falla sin dominio', () => {
    expect(metaUniversidad(null).sigla).toBe('UNI');
    expect(metaUniversidad(undefined).sigla).toBe('UNI');
  });

  it('cada universidad tiene al menos una sede sugerida', () => {
    for (const dominio of ['utp.edu.pe', 'upc.edu.pe', 'utec.edu.pe', 'aloe.ulima.edu.pe', 'usil.pe', 'upn.edu.pe', 'pucp.edu.pe', 'ucvvirtual.edu.pe', 'unmsm.edu.pe', 'uwiener.edu.pe']) {
      expect(metaUniversidad(dominio).sedes.length).toBeGreaterThan(0);
    }
  });

  it('acepta solo el correo del dominio exacto de la universidad', () => {
    expect(correoEsDeLaUniversidad('u22303581@utp.edu.pe', 'utp.edu.pe')).toBe(true);
    expect(correoEsDeLaUniversidad('  U22303581@UTP.EDU.PE ', 'utp.edu.pe')).toBe(true);
    expect(correoEsDeLaUniversidad('alguien@gmail.com', 'utp.edu.pe')).toBe(false);
    expect(correoEsDeLaUniversidad('alguien@mail.utp.edu.pe', 'utp.edu.pe')).toBe(false);
    expect(correoEsDeLaUniversidad('@utp.edu.pe', 'utp.edu.pe')).toBe(false);
    expect(correoEsDeLaUniversidad('a@utp.edu.pe', null)).toBe(false);
  });

  it('sugiere carreras sin repetir', () => {
    expect(new Set(CARRERAS).size).toBe(CARRERAS.length);
  });
});
