/**
 * Utilidades generales para la aplicación
 */
export class Helpers {
  /**
   * Genera un ID único
   */
  static generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Formatea una fecha a string
   */
  static formatDate(date: Date | string, format: string = 'DD/MM/YYYY'): string {
    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return '';
    }

    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');

    return format
      .replace('DD', day)
      .replace('MM', month)
      .replace('YYYY', year.toString())
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  /**
   * Formatea un número con separadores de miles
   */
  static formatNumber(value: number, decimals: number = 0): string {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  /**
   * Formatea una moneda
   */
  static formatCurrency(value: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
    }).format(value);
  }

  /**
   * Capitaliza la primera letra de una cadena
   */
  static capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Capitaliza cada palabra de una cadena
   */
  static capitalizeWords(str: string): string {
    if (!str) return '';
    return str
      .split(' ')
      .map((word) => this.capitalize(word))
      .join(' ');
  }

  /**
   * Convierte una cadena a slug
   */
  static slugify(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Trunca una cadena a una longitud específica
   */
  static truncate(str: string, length: number, suffix: string = '...'): string {
    if (!str || str.length <= length) return str;
    return str.substring(0, length) + suffix;
  }

  /**
   * Verifica si un valor es un email válido
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Verifica si un valor es una URL válida
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene el tamaño de archivo en formato legible
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Debounce para funciones
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: number;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => func.apply(this, args), wait);
    };
  }

  /**
   * Throttle para funciones
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Clona un objeto profundamente
   */
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as any;
    if (obj instanceof Array) return obj.map((item) => this.deepClone(item)) as any;
    if (typeof obj === 'object') {
      const clonedObj = {} as any;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
    return obj;
  }

  /**
   * Verifica si dos objetos son iguales
   */
  static isEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== typeof obj2) return false;

    if (typeof obj1 === 'object') {
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);

      if (keys1.length !== keys2.length) return false;

      for (const key of keys1) {
        if (!keys2.includes(key)) return false;
        if (!this.isEqual(obj1[key], obj2[key])) return false;
      }

      return true;
    }

    return obj1 === obj2;
  }

  /**
   * Obtiene un valor anidado de un objeto usando notación de punto
   */
  static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Establece un valor anidado en un objeto usando notación de punto
   */
  static setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  /**
   * Genera un color aleatorio en formato hex
   */
  static randomColor(): string {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  /**
   * Convierte un color hex a RGB
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  /**
   * Convierte RGB a hex
   */
  static rgbToHex(r: number, g: number, b: number): string {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  static formatLocalDateTime(fecha: any, hora?: string): string | null {
    if (!fecha) return null;

    let d: Date;

    // Si es string en formato dd/MM/yyyy o dd/MM/yyyy (con o sin HS)
    if (typeof fecha === 'string' && fecha.includes('/')) {
      const partes = fecha.split(' ')[0]; // Remover " HS" si existe
      const [dd, mm, yyyy] = partes.split('/');
      d = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
    } else {
      // Si es Date o string ISO
      d = fecha instanceof Date ? new Date(fecha) : new Date(fecha);
    }

    if (isNaN(d.getTime())) return null;

    let hh = '00',
      mm = '00';
    if (hora && typeof hora === 'string') {
      const parts = hora.replace(' HS', '').split(':'); // Remover " HS" si existe
      if (parts.length >= 1) hh = parts[0].padStart(2, '0');
      if (parts.length >= 2) mm = parts[1].padStart(2, '0');
    }

    d.setHours(parseInt(hh, 10) || 0, parseInt(mm, 10) || 0, 0, 0);
    const Y = d.getFullYear();
    const M = String(d.getMonth() + 1).padStart(2, '0');
    const D = String(d.getDate()).padStart(2, '0');
    const H = String(d.getHours()).padStart(2, '0');
    const Min = String(d.getMinutes()).padStart(2, '0');
    return `${Y}-${M}-${D}T${H}:${Min}:00`;
  }

  static buildCirugiaPayload(data: any): any {
      // Usar el mapeo avanzado para normalizar fecha/hora y campos, eliminando fechaInicio y horaInicio
      const payload = Helpers.toFrontRequest(data);
      if (payload) {
        delete payload.fechaInicio;
        delete payload.horaInicio;
      }
      return payload;
    }

    /**
     * Mapea un objeto FrontResponse a FrontRequest, normalizando fecha y hora en fecha_hora_inicio
     */
    static toFrontRequest(front: any): any {
      if (!front) return null;
      const nuevo: any = {
        id: front.id,
        prioridad: front.prioridad,
        estado: front.estado,
        anestesia: front.anestesia,
        tipo: front.tipo,
        servicioId: front.servicioId,
        pacienteId: front.pacienteId,
        quirofanoId: front.quirofanoId,
        // ...agrega aquí cualquier otro campo que tenga tu FrontRequest...
      };

      if (front.fechaInicio && front.horaInicio) {
        try {
          // Normalizar fecha: de dd/MM/yyyy a yyyy-MM-dd
          let fechaStr = String(front.fechaInicio).trim();
          if (fechaStr.includes('/')) {
            const [d, m, y] = fechaStr.split('/');
            fechaStr = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
          }
          // Normalizar hora: quitar " HS", asegurar formato HH:mm:ss
          let horaStr = String(front.horaInicio).replace(' HS', '').trim();
          const partes = horaStr.split(':');
          if (partes.length === 2 && partes[0].length === 1) {
            horaStr = '0' + horaStr;
          }
          if (horaStr.length === 5) {
            horaStr += ':00';
          }
          // Combinar fecha y hora en formato ISO string (yyyy-MM-ddTHH:mm:ss)
          const fechaHoraStr = `${fechaStr}T${horaStr}`;
          nuevo.fecha_hora_inicio = fechaHoraStr;
        } catch (e) {
          console.error('Error combinando fechaInicio y horaInicio:', front.fechaInicio, front.horaInicio, e);
          nuevo.fecha_hora_inicio = null;
        }
      } else {
        nuevo.fecha_hora_inicio = null;
      }
      console.log('toFrontRequest - front:', front, '-> nuevo:', nuevo);
      return nuevo;
  }
}
