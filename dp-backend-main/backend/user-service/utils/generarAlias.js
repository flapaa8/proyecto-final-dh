import fs from 'fs/promises';

const rutaPalabras = './data/palabras.txt';

export async function generarAlias() {
  try {
    const data = await fs.readFile(rutaPalabras, 'utf-8');
    const palabras = data.split('\n').map(p => p.trim()).filter(Boolean);
    const alias = [];
    while (alias.length < 3) {
      const palabra = palabras[Math.floor(Math.random() * palabras.length)];
      if (!alias.includes(palabra)) alias.push(palabra);
    }
    return alias.join('.');
  } catch {
    return 'alias.generico.demo';
  }
}


