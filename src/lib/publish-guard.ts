import { validateSiteData, type SiteData } from './schema';
import { PRESETS, getContrastRatio } from './presets';

const BRACKET_MARKER_REGEX = /\[[^\]]+\]/;

export function isDemoMode(): boolean {
  const envVal = import.meta.env.PUBLIC_DEMO;
  return envVal === 'true';
}

function scanStringsForMarkers(node: unknown, path: string, errors: string[]): void {
  if (typeof node === 'string') {
    if (BRACKET_MARKER_REGEX.test(node)) {
      errors.push(`Marcador sin reemplazar en "${path}": "${node}"`);
    }
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((item, idx) => scanStringsForMarkers(item, `${path}[${idx}]`, errors));
    return;
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      // Ignora claves "placeholder"
      if (key === 'placeholder') continue;
      scanStringsForMarkers(value, path ? `${path}.${key}` : key, errors);
    }
  }
}

function checkImageSrc(img: { src: string }, path: string, errors: string[]): void {
  if (!img.src || img.src.trim() === '') {
    errors.push(`Imagen sin "src" en sección visible: "${path}.src"`);
  }
}

export function getValidatedSite(raw: unknown): { site: SiteData; isDemo: boolean } {
  const site = validateSiteData(raw);
  const isDemo = isDemoMode();

  // Validación de contraste en caso de que diseno.colores sobrescriba el preset
  const basePalette = PRESETS[site.diseno.preset].colores;
  const finalPalette = { ...basePalette, ...(site.diseno.colores ?? {}) };

  const pairsToVerify: Array<[string, string, string]> = [
    ['ink vs surface', finalPalette.ink, finalPalette.surface],
    ['ink vs surfaceAlt', finalPalette.ink, finalPalette.surfaceAlt],
    ['onPrimary vs primary', finalPalette.onPrimary, finalPalette.primary],
    ['accent vs surface', finalPalette.accent, finalPalette.surface],
  ];

  for (const [label, fg, bg] of pairsToVerify) {
    const ratio = getContrastRatio(fg, bg);
    if (ratio < 4.5) {
      throw new Error(
        `[Contraste WCAG Error] El par (${label}: ${fg} / ${bg}) tiene ratio ${ratio}:1 (mínimo requerido: 4.5:1).`
      );
    }
  }

  // En desarrollo o cuando PUBLIC_DEMO === "true", dejamos pasar sin freno de producción
  if (!import.meta.env.PROD || isDemo) {
    return { site, isDemo };
  }

  const errors: string[] = [];
  const ordenActivo = new Set(site.diseno.orden);

  const isVisible = (id: string, flag?: boolean): boolean => {
    if (flag === false) return false;
    return ordenActivo.has(id as any);
  };

  // 1. Escanear [marcadores] solo en bloques activos
  scanStringsForMarkers(site.negocio, 'negocio', errors);
  scanStringsForMarkers(site.diseno, 'diseno', errors);
  scanStringsForMarkers(site.carta, 'carta', errors);
  scanStringsForMarkers(site.contacto, 'contacto', errors);
  scanStringsForMarkers(site.footer, 'footer', errors);
  scanStringsForMarkers(site.seo, 'seo', errors);

  if (isVisible('hero')) {
    scanStringsForMarkers(site.hero, 'hero', errors);
    checkImageSrc(site.hero.imagen, 'hero.imagen', errors);
  }

  if (isVisible('destacados')) {
    scanStringsForMarkers(site.destacados, 'destacados', errors);
    site.destacados.forEach((d, i) => checkImageSrc(d.imagen, `destacados[${i}].imagen`, errors));
  }

  if (isVisible('nosotros')) {
    scanStringsForMarkers(site.nosotros, 'nosotros', errors);
    checkImageSrc(site.nosotros.imagen, 'nosotros.imagen', errors);
  }

  if (isVisible('ubicacion')) {
    scanStringsForMarkers(site.ubicacion, 'ubicacion', errors);
  }

  if (isVisible('faq')) {
    scanStringsForMarkers(site.faq, 'faq', errors);
  }

  if (isVisible('pedidos', site.flags.mostrarPedidos)) {
    scanStringsForMarkers(site.pedidos, 'pedidos', errors);
  }

  if (isVisible('galeria', site.flags.mostrarGaleria)) {
    scanStringsForMarkers(site.galeria, 'galeria', errors);
    site.galeria.forEach((img, i) => checkImageSrc(img, `galeria[${i}]`, errors));
  }

  if (isVisible('eventos', site.flags.mostrarEventos)) {
    scanStringsForMarkers(site.eventos, 'eventos', errors);
    checkImageSrc(site.eventos.imagen, 'eventos.imagen', errors);
  }

  if (isVisible('testimonios', site.flags.mostrarTestimonios)) {
    scanStringsForMarkers(site.testimonios, 'testimonios', errors);
  }

  // Imágenes de categorías de carta (visibles siempre en /carta y en carta-resumen)
  site.carta.categorias.forEach((cat, i) => {
    checkImageSrc(cat.imagen, `carta.categorias[${i}].imagen`, errors);
  });

  // 2. Verificar mapaEmbedUrl si ubicacion está activa
  if (isVisible('ubicacion')) {
    const mapUrl = site.ubicacion.mapaEmbedUrl.trim();
    if (!mapUrl || BRACKET_MARKER_REGEX.test(mapUrl) || !mapUrl.startsWith('https://')) {
      errors.push('Falta una URL válida en "ubicacion.mapaEmbedUrl" (debe iniciar con https://).');
    }
  }

  // 3. Verificar enlace del Libro de Reclamaciones de Indecopi
  const libroUrl = site.footer.libroReclamacionesUrl.trim();
  if (!libroUrl || BRACKET_MARKER_REGEX.test(libroUrl)) {
    errors.push('Falta el enlace obligatorio del Libro de Reclamaciones en "footer.libroReclamacionesUrl".');
  }

  // 4. Verificar precios cuando mostrarPrecios es true
  if (site.flags.mostrarPrecios) {
    if (isVisible('destacados')) {
      site.destacados.forEach((item, idx) => {
        if (item.precio === null) {
          errors.push(`"destacados[${idx}]" (${item.nombre}) tiene precio null con mostrarPrecios=true.`);
        }
      });
    }
    site.carta.categorias.forEach((cat, cIdx) => {
      cat.items.forEach((item, iIdx) => {
        if (item.precio === null && !item.precioDesde) {
          errors.push(
            `"carta.categorias[${cIdx}].items[${iIdx}]" (${item.nombre}) tiene precio null sin precioDesde=true.`
          );
        }
      });
    });
  }

  if (errors.length > 0) {
    throw new Error(
      `\n[PUBLISH GUARD] El build de producción fue detenido porque faltan datos reales del cliente:\n` +
        errors.map((e) => `  ✖ ${e}`).join('\n') +
        `\n\nPara compilar una vista previa de demostración ejecuta: PUBLIC_DEMO=true npx astro build\n`
    );
  }

  return { site, isDemo };
}