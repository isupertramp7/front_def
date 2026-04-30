const { parseISO, differenceInMinutes, format } = require('date-fns');

function calcularHorasTrabajadas(entrada, salida) {
  const minutos = differenceInMinutes(salida, entrada);
  return parseFloat((minutos / 60).toFixed(2));
}

function calcularAtraso(fechaHoraEntrada, horarioEntrada, toleranciaMinutos) {
  const [hh, mm] = horarioEntrada.split(':').map(Number);
  const limite = new Date(fechaHoraEntrada);
  limite.setHours(hh, mm + toleranciaMinutos, 0, 0);
  return fechaHoraEntrada > limite;
}

function calcularHorasExtra(horasTrabajadas, jornadaEsperada = 8) {
  const extra = horasTrabajadas - jornadaEsperada;
  return parseFloat(Math.max(0, extra).toFixed(2));
}

module.exports = { calcularHorasTrabajadas, calcularAtraso, calcularHorasExtra };
