import { z } from "zod";

export type Organizacion =
  | "Sociedad de Socorro"
  | "Cuórum de Elderes"
  | "Jas"
  | "Primaria"
  | "Administración"
  | "Otros";

export const categoriaGastoSchema = z.object({
  categoria: z.string().min(1, "La categoría es requerida"),
  cantidad: z.number().positive("La cantidad debe ser mayor a 0"),
});

export const formularioGastosSchema = z
  .object({
    // Datos básicos
    nombreSolicitante: z
      .string()
      .min(3, "El nombre del solicitante debe tener al menos 3 caracteres")
      .max(100, "El nombre es demasiado largo")
      .refine(
        (val) => {
          const palabras = val.trim().split(/\s+/);
          return palabras.length >= 2;
        },
        {
          message: "Debe incluir al menos nombre y apellido",
        }
      ),
    nombreCobrador: z
      .string()
      .min(3, "El nombre del cobrador debe tener al menos 3 caracteres")
      .max(100, "El nombre es demasiado largo")
      .refine(
        (val) => {
          const palabras = val.trim().split(/\s+/);
          return palabras.length >= 2;
        },
        {
          message: "Debe incluir al menos nombre y apellido",
        }
      ),
    fecha: z
      .string()
      .min(1, "La fecha es requerida")
      .refine(
        (val) => {
          const fecha = new Date(val);
          const año = fecha.getFullYear();
          return año >= 2024;
        },
        {
          message: "La fecha debe ser del año 2024 en adelante",
        }
      ),

    // Propósito del gasto
    descripcionComplemento: z
      .string()
      .min(10, "La descripción debe tener al menos 10 caracteres")
      .max(200, "La descripción es demasiado larga")
      .refine(
        (val) => {
          const textosGenericos = [
            "fortalecer la fe de los miembros a través de",
            "fortalecer la fe",
            "actividad para",
            "reunión de",
            "evento para"
          ];
          const textoLower = val.toLowerCase().trim();
          return !textosGenericos.some(generico => 
            textoLower.includes(generico) && textoLower.length < 50
          );
        },
        {
          message: "Por favor, proporcione una descripción más específica del gasto",
        }
      ),
    organizacion: z.enum([
      "Sociedad de Socorro",
      "Cuórum de Elderes", 
      "Jas",
      "Primaria",
      "Administración",
      "Otros",
    ]),
    organizacionOtra: z.string().optional(),

    // Monto
    montoTotal: z
      .number({ message: "El monto debe ser un número válido" })
      .positive("El monto debe ser mayor a 0")
      .min(0.01, "El monto debe ser mayor a 0")
      .max(999999, "El monto es demasiado alto"),

    // Categorías (opcional)
    categorias: z.array(categoriaGastoSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.organizacion === "Otros") {
        return !!data.organizacionOtra && data.organizacionOtra.length > 0;
      }
      return true;
    },
    {
      message: "Debe especificar la organización",
      path: ["organizacionOtra"],
    }
  );

export type FormularioGastosFormData = z.infer<typeof formularioGastosSchema>;
