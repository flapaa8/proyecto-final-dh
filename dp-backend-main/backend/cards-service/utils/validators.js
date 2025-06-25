export function esTarjetaValida(tarjeta) {
  return tarjeta.numero && tarjeta.vencimiento && tarjeta.nombreTitular && tarjeta.codigoSeguridad;
}
