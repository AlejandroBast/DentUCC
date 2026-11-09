import { Component, signal } from '@angular/core';

interface Paso {
  numero: number;
  icono: string;
  titulo: string;
  texto: string;
}

interface Recomendacion {
  icono: string;
  etiqueta: string;
  titulo: string;
  texto: string;
}

interface Comando {
  nombre: string;
  uso: string;
}

interface Pregunta {
  pregunta: string;
  respuesta: string;
}

@Component({
  selector: 'app-recomendaciones',
  templateUrl: './recomendaciones.html',
  styleUrl: './recomendaciones.css',
})
export class Recomendaciones {
  pasos: Paso[] = [
    {
      numero: 1,
      icono: 'preparar',
      titulo: 'Preparar',
      texto: 'Antes de ponerse los guantes, abra DentUCC, ingrese los datos del examen y active el dictado.',
    },
    {
      numero: 2,
      icono: 'dictado',
      titulo: 'Dictar',
      texto: 'Diga el diente, la cara y los valores en orden. Use los comandos de voz para controlar el registro.',
    },
    {
      numero: 3,
      icono: 'revisar',
      titulo: 'Revisar',
      texto: 'Al terminar, compruebe los valores dudosos, el NIC y la gráfica antes de exportar el PDF.',
    },
  ];

  recomendaciones: Recomendacion[] = [
    {
      icono: 'preparar',
      etiqueta: 'Antes del examen',
      titulo: 'Prepare antes de los guantes',
      texto: 'Abra DentUCC, ingrese los datos del examen y active el dictado antes de empezar. Después no necesitará tocar el dispositivo.',
    },
    {
      icono: 'dispositivo',
      etiqueta: 'Ubicación',
      titulo: 'Ubique bien el dispositivo',
      texto: 'Déjelo a unos 30–50 cm, estable y con el micrófono despejado.',
    },
    {
      icono: 'microfono',
      etiqueta: 'Configuración',
      titulo: 'Use un navegador compatible',
      texto: 'Use Chrome o Edge actualizados, permita el acceso al micrófono y mantenga una conexión a internet.',
    },
    {
      icono: 'dictado',
      etiqueta: 'Dictado',
      titulo: 'Dicte con claridad',
      texto: 'Diga el diente, la cara y los valores en orden. Por ejemplo: “diente 16 vestibular 3-2-4”. Espere la confirmación de cada valor.',
    },
    {
      icono: 'revisar',
      etiqueta: 'Corrección',
      titulo: 'Corrija al instante',
      texto: 'Si se equivoca, diga “corregir” y repita el valor.',
    },
    {
      icono: 'revisar',
      etiqueta: 'Cierre',
      titulo: 'Revise al terminar',
      texto: 'Verifique los valores marcados como dudosos, el NIC y la gráfica; luego exporte el PDF.',
    },
    {
      icono: 'cuidado',
      etiqueta: 'Privacidad',
      titulo: 'Proteja la información',
      texto: 'En esta versión demostrativa, use solo datos ficticios.',
    },
    {
      icono: 'cuidado',
      etiqueta: 'Criterio profesional',
      titulo: 'El criterio es suyo',
      texto: 'La orientación diagnóstica es preliminar y debe confirmarla el docente o profesional.',
    },
  ];

  comandos: Comando[] = [
    { nombre: 'corregir', uso: 'Repetir el último valor dictado cuando necesite corregirlo.' },
    { nombre: 'pausar', uso: 'Pausar temporalmente la captura por voz.' },
    { nombre: 'sangrado', uso: 'Indicar el registro de sangrado en el sitio evaluado.' },
    { nombre: 'movilidad', uso: 'Indicar que va a registrar la movilidad dental.' },
    { nombre: 'furca', uso: 'Indicar que va a registrar el compromiso de furcación.' },
    { nombre: 'ausente', uso: 'Marcar el diente como ausente.' },
    { nombre: 'finalizar', uso: 'Terminar el dictado del examen.' },
  ];

  preguntas: Pregunta[] = [
    {
      pregunta: '¿Necesito internet?',
      respuesta: 'Sí. Para el flujo de dictado por voz propuesto, use una conexión activa y Chrome o Edge actualizados.',
    },
    {
      pregunta: '¿Dónde se guardan los datos?',
      respuesta: 'Esta versión demostrativa no integra un sistema de almacenamiento clínico. Trate la información como temporal y use únicamente datos ficticios.',
    },
    {
      pregunta: '¿DentUCC reemplaza la historia clínica?',
      respuesta: 'No. Es una herramienta de apoyo para el registro periodontal y no reemplaza la historia clínica ni los protocolos de la institución.',
    },
  ];

  aviso = signal('');

  exportar(): void {
    window.print();
  }

  compartir(): void {
    const url = location.href;
    if (typeof navigator.share === 'function') {
      navigator
        .share({ title: 'Guía de uso de DentUCC', url })
        .catch(() => this.avisar('No se pudo compartir la guía'));
    } else {
      this.copiarTexto(url, 'Enlace copiado');
    }
  }

  copiar(): void {
    const recomendaciones = this.recomendaciones
      .map(recomendacion => `• ${recomendacion.titulo}: ${recomendacion.texto}`)
      .join('\n');
    const comandos = this.comandos
      .map(comando => `• ${comando.nombre}: ${comando.uso}`)
      .join('\n');
    this.copiarTexto(`${recomendaciones}\n\nComandos de voz\n${comandos}`, 'Guía copiada');
  }

  private copiarTexto(texto: string, mensaje: string): void {
    if (!navigator.clipboard) {
      this.avisar('El navegador no permite copiar');
      return;
    }

    navigator.clipboard
      .writeText(texto)
      .then(() => this.avisar(mensaje))
      .catch(() => this.avisar('No se pudo copiar'));
  }

  private avisar(mensaje: string): void {
    this.aviso.set(mensaje);
    setTimeout(() => this.aviso.set(''), 2000);
  }
}
