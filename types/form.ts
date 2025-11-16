export type Organizacion =
  | "Sociedad de Socorro"
  | "Cuórum de Elderes"
  | "Jas"
  | "Primaria"
  | "Administración"
  | "Otros";

export interface CategoriaGasto {
  categoria: string;
  cantidad: number;
}

export interface FormularioGastosData {
  // Datos básicos
  nombreSolicitante: string;
  nombreCobrador: string;
  fecha: string;

  // Propósito del gasto
  descripcionComplemento: string;
  organizacion: Organizacion;
  organizacionOtra?: string;

  // Monto
  montoTotal: number;

  // Categorías (opcional)
  categorias?: CategoriaGasto[];
}
