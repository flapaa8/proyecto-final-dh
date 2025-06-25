export function generarCVU() {
  return Array.from({ length: 22 }, () => Math.floor(Math.random() * 10)).join('');
}

