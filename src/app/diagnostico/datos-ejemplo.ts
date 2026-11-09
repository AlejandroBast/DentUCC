import { Cara, Diente, Periodontograma } from './diagnostico.models';

function cara(profundidades: number[], sangrados: boolean[]): Cara {
  return [
    { profundidad: profundidades[0], sangrado: sangrados[0] }, // distal
    { profundidad: profundidades[1], sangrado: sangrados[1] }, // centro
    { profundidad: profundidades[2], sangrado: sangrados[2] }, // mesial
  ];
}

function diente(numero: number, vestibular: Cara | null, palatinoLingual: Cara | null): Diente {
  return { numero, vestibular, palatinoLingual };
}

const SIN_SANGRADO = [false, false, false];

export const PERIODONTOGRAMA_EJEMPLO: Periodontograma = {
  paciente: 'Paciente de ejemplo',
  historiaClinica: 'HC-0142',
  fecha: '2026-11-08',
  dientes: [
    diente(18, cara([2, 1, 2], SIN_SANGRADO), cara([3, 2, 3], [false, false, true])),
    diente(17, cara([3, 3, 4], [false, false, true]), cara([4, 3, 4], [true, false, true])),
    diente(16, cara([4, 3, 5], [true, false, true]), cara([5, 4, 4], [true, true, false])),
    diente(15, cara([2, 2, 3], SIN_SANGRADO), cara([2, 2, 3], [false, false, true])),
    diente(14, cara([2, 1, 2], SIN_SANGRADO), cara([2, 1, 2], SIN_SANGRADO)),
    diente(13, cara([2, 1, 2], SIN_SANGRADO), cara([2, 1, 2], SIN_SANGRADO)),
    diente(12, cara([2, 1, 2], SIN_SANGRADO), cara([2, 2, 2], SIN_SANGRADO)),
    diente(11, cara([2, 1, 2], [false, true, false]), cara([2, 2, 2], SIN_SANGRADO)),

    diente(21, cara([2, 1, 2], SIN_SANGRADO), cara([2, 1, 2], SIN_SANGRADO)),
    diente(22, cara([2, 1, 2], SIN_SANGRADO), cara([2, 1, 2], SIN_SANGRADO)),
    diente(23, cara([2, 1, 2], SIN_SANGRADO), cara([2, 2, 2], [false, false, true])),
    diente(24, cara([2, 2, 3], SIN_SANGRADO), cara([2, 2, 3], SIN_SANGRADO)),
    diente(25, cara([2, 2, 3], SIN_SANGRADO), null),
    diente(26, cara([5, 4, 4], [true, true, false]), cara([4, 3, 5], [true, false, true])),
    diente(27, cara([3, 2, 3], SIN_SANGRADO), null),
    diente(28, null, null),

    diente(31, cara([2, 1, 2], SIN_SANGRADO), cara([2, 1, 2], SIN_SANGRADO)),
    diente(32, cara([2, 1, 2], SIN_SANGRADO), cara([2, 1, 2], SIN_SANGRADO)),
    diente(33, cara([2, 1, 2], SIN_SANGRADO), cara([2, 1, 2], [false, false, true])),
    diente(34, cara([2, 2, 3], SIN_SANGRADO), cara([2, 2, 3], SIN_SANGRADO)),
    diente(35, cara([2, 2, 3], SIN_SANGRADO), cara([2, 1, 3], SIN_SANGRADO)),
    diente(36, cara([4, 4, 5], [true, false, true]), cara([5, 4, 4], [true, true, false])),
    diente(37, cara([3, 2, 3], SIN_SANGRADO), null),
    diente(38, null, null),

    diente(41, cara([1, 1, 2], SIN_SANGRADO), cara([2, 1, 2], SIN_SANGRADO)),
    diente(42, cara([2, 1, 2], [false, true, false]), cara([2, 1, 2], SIN_SANGRADO)),
    diente(43, cara([2, 1, 2], SIN_SANGRADO), cara([2, 1, 2], SIN_SANGRADO)),
    diente(44, cara([2, 1, 2], SIN_SANGRADO), cara([2, 2, 3], SIN_SANGRADO)),
    diente(45, cara([2, 2, 3], SIN_SANGRADO), cara([2, 2, 3], [false, false, true])),
    diente(46, cara([5, 3, 4], [true, false, true]), cara([4, 4, 5], [false, true, true])),
    diente(47, cara([4, 4, 3], [false, true, false]), cara([4, 3, 3], [true, false, false])),
    diente(48, null, null),
  ],
};
