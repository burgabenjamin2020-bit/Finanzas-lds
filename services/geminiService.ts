import { GoogleGenAI, Type } from "@google/genai";
import { ReceiptData } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const model = 'gemini-2.5-flash';

const receiptSchema = {
    type: Type.OBJECT,
    properties: {
        receiptNumber: { type: Type.STRING, description: "El número de la boleta o comprobante, ej. '001-000306'." },
        vendor: { type: Type.STRING, description: "El nombre del comercio o proveedor." },
        date: { type: Type.STRING, description: "La fecha de la transacción en formato YYYY-MM-DD." },
        total: { type: Type.NUMBER, description: "El monto total de la boleta. DEBE SER LA SUMA DE TODOS LOS 'lineItems'. No uses el total impreso si es diferente a la suma." },
        isBoleta: { type: Type.BOOLEAN, description: "Verdadero si el documento es una 'Boleta de Venta' o similar, falso en caso contrario." },
        lineItems: {
            type: Type.ARRAY,
            description: "Una lista de todos los productos o servicios en la boleta.",
            items: {
                type: Type.OBJECT,
                properties: {
                    description: { type: Type.STRING, description: "La descripción del producto o servicio, corregida ortográficamente y en MAYÚSCULAS." },
                    amount: { type: Type.NUMBER, description: "El precio del producto o servicio." }
                },
                required: ["description", "amount"]
            }
        }
    },
    required: ["receiptNumber", "vendor", "date", "total", "isBoleta", "lineItems"]
};

const multipleReceiptsSchema = {
    type: Type.ARRAY,
    items: receiptSchema
};


export const extractReceiptData = async (imageBase64: string): Promise<ReceiptData[]> => {
  try {
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64,
      },
    };

    const textPart = {
      text: "Analiza la siguiente imagen, que puede contener **una o varias boletas de venta** en español. Tu tarea es identificar y procesar **CADA boleta individualmente**.\n\nPara cada boleta encontrada, realiza las siguientes tareas en orden:\n1. Extrae el NÚMERO DE BOLETA (ej. '001-000306').\n2. Extrae el nombre del proveedor y la fecha (YYYY-MM-DD).\n3. Extrae una lista de todos los productos. Para cada producto, corrige cualquier error ortográfico obvio en la descripción (ej. 'mayoneto' a 'MAYONESA', 'leguga' a 'LECHUGA') y convierte la descripción final a MAYÚSCULAS.\n4. Suma los precios de todos los productos para obtener el total verificado. Si el total impreso difiere de tu suma o es ilegible, USA TU SUMA como el total final.\n5. Confirma que es una 'Boleta de Venta' o documento similar.\nEl campo 'total' DEBE ser la suma exacta de los montos de 'lineItems'.\n\nDevuelve el resultado como un **array de objetos JSON**, donde cada objeto representa una boleta analizada y sigue el formato especificado. Si no encuentras ninguna boleta, devuelve un array vacío [].",
    };

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: multipleReceiptsSchema,
      },
    });

    const jsonString = response.text.trim();
    const data = JSON.parse(jsonString);
    return data as ReceiptData[];

  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    
    let userMessage = "No se pudo analizar la boleta. La imagen podría ser muy borrosa, no contener texto claro, o no ser una boleta válida.";
    
    // Check for specific error messages from the API if available
    const errorMessage = error.toString().toLowerCase();
    
    if (errorMessage.includes("safety") || errorMessage.includes("blocked")) {
        userMessage = "El análisis fue bloqueado. La imagen puede contener contenido no permitido por las políticas de seguridad.";
    } else if (errorMessage.includes("api key not valid")) {
        userMessage = "Error de configuración. La clave de API no es válida.";
    } else if (errorMessage.includes("quota")) {
        userMessage = "Se ha excedido la cuota de uso de la API. Por favor, inténtelo más tarde.";
    }

    throw new Error(userMessage);
  }
};
