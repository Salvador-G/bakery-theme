import { z } from 'zod';

const imagenSchema = z.object({
  src: z.string(),
  alt: z.string().min(1, 'Toda imagen requiere un atributo alt descriptivo'),
  placeholder: z.string().min(1, 'El texto de placeholder es obligatorio'),
});

const coloresParcialesSchema = z
  .object({
    surface: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    surfaceAlt: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    ink: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    onPrimary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    primaryHover: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  })
  .optional();

export const seccionIdSchema = z.enum([
  'hero',
  'destacados',
  'carta-resumen',
  'pedidos',
  'nosotros',
  'galeria',
  'eventos',
  'testimonios',
  'ubicacion',
  'faq',
  'contacto',
]);

export const siteSchema = z.object({
  negocio: z.object({
    nombre: z.string().min(1),
    tipo: z.enum(['cafeteria', 'pasteleria', 'panaderia']),
    lema: z.string().min(1),
    distrito: z.string().min(1),
    ciudad: z.string().min(1),
    direccion: z.string().min(1),
    referencia: z.string(),
  }),
  diseno: z.object({
    preset: z.enum(['sobrio', 'editorial', 'calido']),
    colores: coloresParcialesSchema,
    orden: z.array(seccionIdSchema).min(1),
    variantes: z.object({
      hero: z.enum(['dividido', 'centrado', 'fullbleed']),
      servicios: z.enum(['lista', 'rejilla']),
    }),
  }),
  flags: z.object({
    mostrarPrecios: z.boolean(),
    mostrarPedidos: z.boolean(),
    mostrarEventos: z.boolean(),
    mostrarGaleria: z.boolean(),
    mostrarTestimonios: z.boolean(),
    mostrarFormulario: z.boolean(),
  }),
  hero: z.object({
    etiqueta: z.string(),
    titulo: z.string().min(1),
    subtitulo: z.string().min(1),
    ctaPrimario: z.object({ texto: z.string().min(1), url: z.string().min(1) }),
    ctaSecundario: z.object({ texto: z.string().min(1), url: z.string().min(1) }).optional(),
    imagen: imagenSchema,
  }),
  destacados: z
    .array(
      z.object({
        nombre: z.string().min(1),
        descripcion: z.string().min(1),
        precio: z.number().nullable(),
        imagen: imagenSchema,
      })
    )
    .min(3, 'destacados debe tener entre 3 y 4 productos')
    .max(4, 'destacados debe tener entre 3 y 4 productos'),
  carta: z.object({
    avisoAlergenos: z.string().min(1),
    categorias: z
      .array(
        z.object({
          id: z.string().min(1),
          nombre: z.string().min(1),
          descripcion: z.string(),
          imagen: imagenSchema,
          items: z.array(
            z.object({
              nombre: z.string().min(1),
              descripcion: z.string(),
              precio: z.number().nullable(),
              precioDesde: z.boolean(),
              alergenos: z.array(z.string()),
            })
          ),
        })
      )
      .min(1),
  }),
  pedidos: z.object({
    titulo: z.string().min(1),
    anticipacionHoras: z.number().min(0),
    productos: z.array(z.string().min(1)).min(1),
    tamanos: z.array(z.string().min(1)).min(1),
    sabores: z.array(z.string().min(1)).min(1),
    entrega: z.array(z.enum(['Recojo en local', 'Delivery'])).min(1),
    nota: z.string(),
  }),
  nosotros: z.object({
    titulo: z.string().min(1),
    historia: z.string().min(1),
    imagen: imagenSchema,
    datos: z
      .array(
        z.object({
          etiqueta: z.string().min(1),
          valor: z.string().min(1),
          detalle: z.string().min(1),
        })
      )
      .length(3, 'nosotros.datos debe tener exactamente 3 elementos'),
  }),
  galeria: z.array(imagenSchema),
  eventos: z.object({
    titulo: z.string().min(1),
    descripcion: z.string().min(1),
    items: z.array(
      z.object({
        titulo: z.string().min(1),
        detalle: z.string().min(1),
      })
    ),
    imagen: imagenSchema,
  }),
  testimonios: z.array(
    z.object({
      cita: z.string().min(1),
      autor: z.string().min(1),
      contexto: z.string(),
    })
  ),
  ubicacion: z.object({
    horarios: z
      .array(
        z.object({
          dias: z.string().min(1),
          horas: z.string().min(1),
        })
      )
      .min(1),
    comoLlegar: z.string().min(1),
    mapaEmbedUrl: z.string(),
    horariosSchema: z
      .array(
        z.object({
          dayOfWeek: z.array(z.string()).min(1),
          opens: z.string().regex(/^\d{2}:\d{2}$/),
          closes: z.string().regex(/^\d{2}:\d{2}$/),
        })
      )
      .optional(),
  }),
  faq: z.array(
    z.object({
      pregunta: z.string().min(1),
      respuesta: z.string().min(1),
    })
  ),
  contacto: z.object({
    whatsapp: z.string().min(1),
    telefonoMostrar: z.string().min(1),
    email: z.string().min(1),
    mensajeDefault: z.string().min(1),
  }),
  footer: z.object({
    razonSocial: z.string().min(1),
    ruc: z.string().min(1),
    libroReclamacionesUrl: z.string(),
    redes: z.object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      tiktok: z.string().optional(),
    }),
    notaLegal: z.string(),
  }),
  seo: z.object({
    titulo: z.string().min(1),
    descripcion: z.string().min(1),
    ogImage: z.string().optional(),
  }),
});

export type SiteData = z.infer<typeof siteSchema>;
export type ImagenData = z.infer<typeof imagenSchema>;
export type SeccionId = z.infer<typeof seccionIdSchema>;

export function validateSiteData(raw: unknown): SiteData {
  const result = siteSchema.safeParse(raw);
  if (!result.success) {
    const detalles = result.error.issues
      .map((issue) => `  - Campo "${issue.path.join('.')}": ${issue.message}`)
      .join('\n');
    throw new Error(`[Schema Error] site.json es inválido:\n${detalles}`);
  }
  return result.data;
}