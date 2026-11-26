import {
  Coupon,
  InkMode,
  LogoAsset,
  PrintCoverage,
  PrintTechnique,
  PrintTechniqueId,
  Product,
  SecondaryOption,
} from '../types';

export const DEFAULT_IVA_PCT = 16;

export const PRINT_TECHNIQUES: PrintTechnique[] = [
  {
    id: 'vinil-plano',
    name: 'Estampado Estándar / Incluido',
    shortName: 'Estándar',
    description: 'Personalización base incluida según ficha del producto (1 tinta / DTF UV / Sublimación).',
    surchargePerUnit: 0,
    supportsFullColor: true,
    badge: 'Incluido',
  },
  {
    id: 'impreso-plano',
    name: 'Impreso Plano (Serigrafía / DTF)',
    shortName: 'Impreso Plano',
    description: 'Ideal para logos detallados, tipografías finas y múltiples colores planos.',
    surchargePerUnit: 0.15,
    supportsFullColor: true,
    badge: '+$0.15/ud',
  },
  {
    id: 'material-premium',
    name: 'Material Premium (Metálico / Relieve)',
    shortName: 'Premium',
    description: 'Acabado metálico dorado/plata, relieve puff o detalles corporativos especiales.',
    surchargePerUnit: 0.30,
    supportsFullColor: false,
    badge: '+$0.30/ud',
  },
  {
    id: 'full-color',
    name: 'Full Color HD (Sublimación / DTF UV)',
    shortName: 'Full Color',
    description: 'Degradados, fotografías e ilustraciones a todo color de alta definición.',
    surchargePerUnit: 0.20,
    supportsFullColor: true,
    badge: 'HD',
  },
];

export function getTechniqueById(id: PrintTechniqueId): PrintTechnique {
  return PRINT_TECHNIQUES.find((t) => t.id === id) || PRINT_TECHNIQUES[0];
}

export const COMING_SOON_PRODUCTS = [
  {
    id: 'tarjeteros-celular',
    name: 'Tarjeteros para celular',
    tagline: 'Ideales para tarjetas y promociones.',
    imageUrl: '/catalog/tarjeteros-celular.jpg',
  },
  {
    id: 'resaltadores-flor',
    name: 'Resaltadores flor',
    tagline: 'Creativos, llamativos y funcionales.',
    imageUrl: '/catalog/resaltadores-flor.jpg',
  },
  {
    id: 'bolsas-plegables',
    name: 'Bolsas ecológicas plegables',
    tagline: 'Prácticas, reutilizables y listas para tu marca.',
    imageUrl: '/catalog/bolsas-plegables.jpg',
  },
  {
    id: 'boligrafos-metalicos',
    name: 'Bolígrafos metálicos',
    tagline: 'Un clásico promocional que nunca falla.',
    imageUrl: '/catalog/boligrafos-metalicos.jpg',
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'abanico-circular-ribete-negro',
    sku: 'POP-AB-FLEX',
    name: 'Abanicos Plegables Circulares',
    shortName: 'Abanicos Plegables',
    category: 'Abanicos',
    tagline: 'Ligeros, prácticos y con funda al tono · Referencia BCV',
    description:
      'Abanico circular plegable en tela resistente de colores vibrantes con ribete negro perimetral y funda individual. Elige el color de tu abanico sin costo adicional y hazlo parte de tu marca.',
    dimensions: 'Ø 25 cm abierto · Ø 9 cm en funda',
    material: 'Poliéster 190T + ribete negro + aro metálico flexible',
    leadTimeDays: '2 a 4 días hábiles',
    shape: 'circular-flex',
    minOrderQty: 201,
    fullColorSurcharge: 0.20,
    hasPouch: true,
    pouchPrintSurcharge: 0.18,
    supportsFullBleed: false,
    defaultRimHex: '#1A1C20',
    realImageUrl: '/catalog/abanicos-plegables.jpg',
    priceNote: 'Referencia BCV · Sin estampado base (elige estampado opcional)',
    printArea: {
      cx: 270,
      cy: 270,
      width: 268,
      height: 268,
      physicalLabel: 'Ø 18 cm (área de estampado)',
      guideShape: 'circle',
    },
    colors: [
      { id: 'rojo', name: 'Rojo', hex: '#DC2127', stock: 3500, available: true },
      { id: 'morado', name: 'Morado', hex: '#6D1CC7', stock: 3200, available: true, badge: 'Popular' },
      { id: 'azul-rey', name: 'Azul Rey', hex: '#154EC2', stock: 4200, available: true, badge: 'Top ventas' },
      { id: 'azul-claro', name: 'Azul Claro', hex: '#1CA8E8', stock: 3800, available: true },
      { id: 'verde', name: 'Verde', hex: '#15A34A', stock: 3100, available: true },
      { id: 'amarillo', name: 'Amarillo', hex: '#F2DC1D', stock: 3400, available: true },
      { id: 'naranja', name: 'Naranja', hex: '#FF7A00', stock: 2900, available: true },
      { id: 'blanco-rb', name: 'Blanco', hex: '#F4F6F9', stock: 3600, available: true },
      { id: 'fucsia', name: 'Fucsia', hex: '#F72585', stock: 2600, available: true, badge: 'Nuevo' },
    ],
    priceTiers: [
      { minQty: 201, unitPrice: 1.40, promoLabel: '201 - 500 uds' },
      { minQty: 501, unitPrice: 1.30, promoLabel: '501 - 2.000 uds' },
      { minQty: 3000, unitPrice: 1.20, promoLabel: '+3.000 uds BCV' },
    ],
    highlights: [
      'Precios oficiales Referencia BCV: 201-500 ($1.40), 501-2.000 ($1.30), +3.000 ($1.20)',
      'Elige el color de tu abanico sin costo adicional (9 tonos disponibles)',
      'Incluye funda individual al tono · Mockup interactivo 2D, Funda, Surtido y 3D',
    ],
  },
  {
    id: 'bolsa-ecologica-plana',
    sku: 'POP-BOL-PLA',
    name: 'Bolsas Ecológicas — Plana con Asa',
    shortName: 'Bolsa Plana c/Asa',
    category: 'Bolsas y Tulas',
    tagline: 'Reutilizables y resistentes · Incluye 1 estampado · 5 medidas',
    description:
      'Tu marca en una bolsa útil, versátil y lista para destacar. Ideales para marcas, eventos y tiendas. Selecciona la medida exacta en el paso 1 y previsualiza tu logo.',
    dimensions: '17×20 hasta 40×40 cm',
    material: 'Tela ecológica POP reutilizable de alta resistencia',
    leadTimeDays: '3 a 5 días hábiles',
    shape: 'photo-product',
    minOrderQty: 100,
    fullColorSurcharge: 0,
    realImageUrl: '/catalog/bolsas-ecologicas.jpg',
    priceNote: 'Mínimo 100 uds · Incluye 1 estampado · Precio según medida',
    printArea: {
      cx: 195,
      cy: 295,
      width: 175,
      height: 155,
      physicalLabel: 'Área frontal según medida',
      guideShape: 'rounded-rect',
    },
    colors: [
      { id: 'negro', name: 'Negro', hex: '#141519', stock: 3000, available: true, badge: 'Top ventas' },
      { id: 'blanco', name: 'Blanco', hex: '#F8FAFC', stock: 2200, available: true },
      { id: 'azul-rey', name: 'Azul Rey', hex: '#154EC2', stock: 1600, available: true },
      { id: 'morado', name: 'Morado', hex: '#6D1CC7', stock: 1400, available: true },
    ],
    secondaryLabel: 'Medida de Bolsa Plana',
    secondaryOptions: [
      { id: '17x20', name: '17 × 20 cm ($1.00)', hex: '#4C1EDB', stock: 3000, available: true, unitPriceOverride: 1.00 },
      { id: '25x30', name: '25 × 30 cm ($1.20)', hex: '#4C1EDB', stock: 3000, available: true, unitPriceOverride: 1.20 },
      { id: '30x30', name: '30 × 30 cm ($1.50)', hex: '#4C1EDB', stock: 3000, available: true, unitPriceOverride: 1.50 },
      { id: '40x30', name: '40 × 30 cm ($1.80)', hex: '#4C1EDB', stock: 3000, available: true, unitPriceOverride: 1.80 },
      { id: '40x40', name: '40 × 40 cm ($2.00)', hex: '#4C1EDB', stock: 3000, available: true, unitPriceOverride: 2.00 },
    ],
    priceTiers: [
      { minQty: 100, unitPrice: 1.00, promoLabel: 'Mínimo 100 uds' },
    ],
    highlights: [
      'Incluye 1 estampado corporativo de alta nitidez',
      '5 medidas disponibles: 17×20 ($1.00) hasta 40×40 cm ($2.00)',
      'Reutilizables, resistentes e ideales para tiendas y eventos',
    ],
  },
  {
    id: 'bolsa-ecologica-fuelle',
    sku: 'POP-BOL-FUE',
    name: 'Bolsas Ecológicas — Con Asa y Fuelle',
    shortName: 'Bolsa con Fuelle',
    category: 'Bolsas y Tulas',
    tagline: 'Mayor capacidad con fuelle de 10 cm · Incluye 1 estampado',
    description:
      'Bolsa ecológica estructurada con fuelle lateral de 10 cm para mayor volumen y presencia de marca. Ideal para kits corporativos, boutiques y activaciones.',
    dimensions: '15×20×10 hasta 30×30×10 cm',
    material: 'Tela ecológica POP estructurada + fuelle 10 cm',
    leadTimeDays: '3 a 5 días hábiles',
    shape: 'photo-product',
    minOrderQty: 100,
    fullColorSurcharge: 0,
    realImageUrl: '/catalog/bolsas-ecologicas.jpg',
    priceNote: 'Mínimo 100 uds · Incluye 1 estampado · Precio según medida',
    printArea: {
      cx: 385,
      cy: 335,
      width: 165,
      height: 155,
      physicalLabel: 'Área frontal según medida',
      guideShape: 'rounded-rect',
    },
    colors: [
      { id: 'negro', name: 'Negro', hex: '#141519', stock: 2800, available: true, badge: 'Premium' },
      { id: 'blanco', name: 'Blanco', hex: '#F8FAFC', stock: 1800, available: true },
      { id: 'azul-rey', name: 'Azul Rey', hex: '#154EC2', stock: 1400, available: true },
    ],
    secondaryLabel: 'Medida con Fuelle (10 cm)',
    secondaryOptions: [
      { id: '15x20x10', name: '15 × 20 × 10 cm ($1.25)', hex: '#4C1EDB', stock: 2800, available: true, unitPriceOverride: 1.25 },
      { id: '20x25x10', name: '20 × 25 × 10 cm ($1.40)', hex: '#4C1EDB', stock: 2800, available: true, unitPriceOverride: 1.40 },
      { id: '23x30x10', name: '23 × 30 × 10 cm ($1.60)', hex: '#4C1EDB', stock: 2800, available: true, unitPriceOverride: 1.60 },
      { id: '30x30x10', name: '30 × 30 × 10 cm ($1.90)', hex: '#4C1EDB', stock: 2800, available: true, unitPriceOverride: 1.90 },
    ],
    priceTiers: [
      { minQty: 100, unitPrice: 1.25, promoLabel: 'Mínimo 100 uds' },
    ],
    highlights: [
      'Fuelle de 10 cm que brinda gran estabilidad y capacidad',
      '4 medidas: 15×20×10 ($1.25) hasta 30×30×10 cm ($1.90)',
      'Incluye 1 estampado · Mínimo 100 unidades',
    ],
  },
  {
    id: 'tulas-personalizadas',
    sku: 'POP-TUL-3525',
    name: 'Tulas Personalizadas (35 × 25 cm)',
    shortName: 'Tulas 35×25 cm',
    category: 'Bolsas y Tulas',
    tagline: 'Bolso deportivo con cordones · Incluye 1 estampado',
    description:
      'Tulas promocionales de 35 × 25 cm con cordones reforzados de cierre rápido. Perfectas para carreras, kits de bienvenida, gimnasios y eventos corporativos.',
    dimensions: '35 × 25 cm',
    material: 'Poliéster impermeable suave + cordones dobles',
    leadTimeDays: '3 a 5 días hábiles',
    shape: 'photo-product',
    minOrderQty: 50,
    fullColorSurcharge: 0,
    realImageUrl: '/catalog/tulas.jpg',
    priceNote: 'Mínimo 50 uds · $3.00 c/u · Incluye 1 estampado',
    printArea: {
      cx: 270,
      cy: 265,
      width: 195,
      height: 165,
      physicalLabel: '18 × 16 cm (frontal)',
      guideShape: 'rounded-rect',
    },
    colors: [
      { id: 'negro', name: 'Negro', hex: '#141519', stock: 1800, available: true, badge: 'Top ventas' },
      { id: 'blanco', name: 'Blanco', hex: '#F8FAFC', stock: 1500, available: true },
      { id: 'morado', name: 'Morado', hex: '#6D1CC7', stock: 1200, available: true },
    ],
    priceTiers: [
      { minQty: 50, unitPrice: 3.00, promoLabel: 'Precio Oficial' },
    ],
    highlights: [
      'Medidas ideales: 35 × 25 cm',
      'Incluye 1 estampado · Mínimo 50 unidades ($3.00 c/u)',
      'Disponible en Negro, Blanco y Morado',
    ],
  },
  {
    id: 'llaveros-sublimados',
    sku: 'POP-LLA-SUB',
    name: 'Llaveros Sublimados (Cinta Premium)',
    shortName: 'Llaveros Sublimados',
    category: 'Llaveros',
    tagline: 'Cinta premium full color con argolla reforzada',
    description:
      'Llaveros en cinta satinada premium con personalización full color de borde a borde y argolla metálica resistente. Uno de los artículos POP de mayor recordación.',
    dimensions: '14 × 2.5 cm · Argolla metálica',
    material: 'Cinta poliéster satinada sublimada full color',
    leadTimeDays: '3 a 5 días hábiles',
    shape: 'photo-product',
    minOrderQty: 200,
    fullColorSurcharge: 0,
    realImageUrl: '/catalog/llaveros-sublimados.jpg',
    priceNote: 'A partir de 200 uds · $1.00 c/u · Incluye full color',
    printArea: {
      cx: 270,
      cy: 265,
      width: 170,
      height: 140,
      physicalLabel: 'Full color en cinta',
      guideShape: 'rounded-rect',
    },
    colors: [
      { id: 'morado', name: 'Morado', hex: '#6D1CC7', stock: 4000, available: true, badge: 'Popular' },
      { id: 'turquesa', name: 'Turquesa', hex: '#0891B2', stock: 3500, available: true },
      { id: 'verde-lima', name: 'Verde Lima', hex: '#84CC16', stock: 3200, available: true },
      { id: 'azul-rey', name: 'Azul Rey', hex: '#154EC2', stock: 3800, available: true },
      { id: 'naranja', name: 'Naranja', hex: '#FF7A00', stock: 3000, available: true },
    ],
    priceTiers: [
      { minQty: 200, unitPrice: 1.00, promoLabel: 'Desde 200 uds' },
    ],
    highlights: [
      'Cinta premium con personalización full color incluida',
      'A partir de 200 unidades a $1.00 c/u',
      'Colores y diseños corporativos sin límite de tonos',
    ],
  },
  {
    id: 'llaveros-acrilico',
    sku: 'POP-LLA-ACR',
    name: 'Llaveros en Acrílico Full Color',
    shortName: 'Llaveros Acrílico',
    category: 'Llaveros',
    tagline: 'Corte láser de precisión + impresión a full color',
    description:
      'Llaveros modernos en acrílico de alto brillo con personalización a full color y argolla metálica. Perfectos para marcas creativas, lanzamientos y hoteles.',
    dimensions: '7 × 3.5 cm (personalizable)',
    material: 'Acrílico 3 mm + impresión UV full color + argolla',
    leadTimeDays: '3 a 5 días hábiles',
    shape: 'photo-product',
    minOrderQty: 60,
    fullColorSurcharge: 0,
    realImageUrl: '/catalog/llaveros-acrilico.jpg',
    priceNote: 'Mínimo 60 uds · $1.80 c/u · Incluye full color',
    printArea: {
      cx: 310,
      cy: 280,
      width: 170,
      height: 150,
      physicalLabel: 'Full color sobre acrílico',
      guideShape: 'rounded-rect',
    },
    colors: [
      { id: 'negro', name: 'Negro', hex: '#141519', stock: 2500, available: true, badge: 'Elegante' },
      { id: 'blanco', name: 'Blanco', hex: '#F8FAFC', stock: 2000, available: true },
      { id: 'transparente', name: 'Transparente', hex: '#E2E8F0', stock: 2200, available: true },
    ],
    priceTiers: [
      { minQty: 60, unitPrice: 1.80, promoLabel: 'Mínimo 60 uds' },
    ],
    highlights: [
      'Acabado brillante en acrílico de alta durabilidad',
      'Incluye personalización a full color ($1.80 c/u)',
      'Pedido mínimo accesible desde 60 unidades',
    ],
  },
  {
    id: 'llaveros-impresion-3d',
    sku: 'POP-LLA-3D',
    name: 'Llaveros en Impresión 3D',
    shortName: 'Llaveros 3D',
    category: 'Llaveros',
    tagline: 'Forma y volumen 100% personalizado con tu marca',
    description:
      'Llaveros en relieve real fabricados mediante impresión 3D de alta definición. Reproduce tu isotipo, nombre o palabra clave con impacto visual único.',
    dimensions: 'A medida (6 a 8 cm)',
    material: 'PLA / Filamento 3D multicolor + argolla metálica',
    leadTimeDays: '4 a 6 días hábiles',
    shape: 'photo-product',
    minOrderQty: 24,
    fullColorSurcharge: 0,
    realImageUrl: '/catalog/llaveros-3d.jpg',
    priceNote: 'Mínimo 24 uds · Desde $3.00 c/u · Incluye personalización',
    printArea: {
      cx: 270,
      cy: 270,
      width: 190,
      height: 140,
      physicalLabel: 'Relieve 3D a medida',
      guideShape: 'rounded-rect',
    },
    colors: [
      { id: 'fucsia', name: 'Fucsia', hex: '#F72585', stock: 1200, available: true, badge: 'Tendencia' },
      { id: 'verde-lima', name: 'Verde Lima', hex: '#A3E635', stock: 1200, available: true },
      { id: 'menta', name: 'Menta', hex: '#6EE7B7', stock: 1000, available: true },
      { id: 'rosa-pastel', name: 'Rosa Pastel', hex: '#F9A8D4', stock: 1000, available: true },
    ],
    priceTiers: [
      { minQty: 24, unitPrice: 3.00, promoLabel: 'Desde 24 uds' },
    ],
    highlights: [
      'Pedido mínimo bajo: desde solo 24 unidades',
      'Personalización tridimensional con la forma de tu logo',
      'Precio oficial desde $3.00 c/u',
    ],
  },
  {
    id: 'cooler-rumberos-520',
    sku: 'POP-COL-520',
    name: 'Cooler Rumberos 520 ml',
    shortName: 'Cooler Rumberos 520ml',
    category: 'Coolers',
    tagline: 'Colores neón vibrantes · Incluye personalización DTF UV',
    description:
      'Cooler ergonómico de 520 ml en tonos translúcidos vibrantes con tapa chupón blanca. Ideal para eventos, conciertos, playas y activaciones masivas.',
    dimensions: '520 ml · Tapa deportiva',
    material: 'Polímero resistente libre de BPA + DTF UV',
    leadTimeDays: '3 a 5 días hábiles',
    shape: 'photo-product',
    minOrderQty: 48,
    fullColorSurcharge: 0,
    realImageUrl: '/catalog/cooler-rumberos.jpg',
    priceNote: 'Mínimo 48 uds · $1.60 c/u · Incluye DTF UV',
    printArea: {
      cx: 265,
      cy: 300,
      width: 155,
      height: 155,
      physicalLabel: 'DTF UV frontal',
      guideShape: 'rounded-rect',
    },
    colors: [
      { id: 'fucsia', name: 'Fucsia', hex: '#F72585', stock: 1800, available: true, badge: 'Popular' },
      { id: 'azul-claro', name: 'Azul Claro', hex: '#22D3EE', stock: 1600, available: true },
      { id: 'verde', name: 'Verde', hex: '#84CC16', stock: 1500, available: true },
      { id: 'morado', name: 'Morado', hex: '#6D1CC7', stock: 1400, available: true },
      { id: 'naranja', name: 'Naranja', hex: '#FF5A1F', stock: 1600, available: true },
      { id: 'amarillo', name: 'Amarillo', hex: '#EAB308', stock: 1400, available: true },
    ],
    priceTiers: [
      { minQty: 48, unitPrice: 1.60, promoLabel: 'Mínimo 48 uds' },
    ],
    highlights: [
      'Incluye personalización en DTF UV a todo color ($1.60 c/u)',
      'Mínimo 48 unidades · Capacidad 520 ml',
      'Disponible en Fucsia, Azul Claro, Verde, Morado, Naranja y Amarillo',
    ],
  },
  {
    id: 'cooler-fit-500',
    sku: 'POP-COL-500',
    name: 'Cooler Fit 500 ml (Libre de BPA)',
    shortName: 'Cooler Fit 500ml',
    category: 'Coolers',
    tagline: 'Práctico, resistente y libre de BPA · Incluye DTF UV',
    description:
      'Cooler Fit de 500 ml diseñado para el día a día, gimnasios y jornadas deportivas. Cuerpo estilizado con agarre anatómico e impresión DTF UV incluida.',
    dimensions: '500 ml · Libre de BPA',
    material: 'PEAD Libre de BPA + tapa deportiva + DTF UV',
    leadTimeDays: '3 a 5 días hábiles',
    shape: 'photo-product',
    minOrderQty: 48,
    fullColorSurcharge: 0,
    realImageUrl: '/catalog/cooler-fit.jpg',
    priceNote: 'Mínimo 48 uds · $1.50 c/u · Incluye DTF UV',
    printArea: {
      cx: 270,
      cy: 300,
      width: 170,
      height: 145,
      physicalLabel: 'DTF UV frontal',
      guideShape: 'rounded-rect',
    },
    colors: [
      { id: 'naranja', name: 'Naranja', hex: '#EA580C', stock: 1900, available: true },
      { id: 'verde', name: 'Verde', hex: '#16A34A', stock: 1700, available: true },
      { id: 'azul', name: 'Azul', hex: '#1D4ED8', stock: 2100, available: true, badge: 'Top ventas' },
      { id: 'blanco', name: 'Blanco', hex: '#F8FAFC', stock: 1850, available: true },
    ],
    priceTiers: [
      { minQty: 48, unitPrice: 1.50, promoLabel: 'Mínimo 48 uds' },
    ],
    highlights: [
      'Ideal para tu día · Libre de BPA · Práctico y resistente',
      'Incluye personalización DTF UV ($1.50 c/u)',
      'Disponible en Naranja, Verde, Azul y Blanco desde 48 uds',
    ],
  },
  {
    id: 'cooler-publicitario-750-dtf',
    sku: 'POP-COL-750D',
    name: 'Cooler Publicitario 750 ml (DTF UV)',
    shortName: 'Cooler 750ml DTF UV',
    category: 'Coolers',
    tagline: 'Gran capacidad 750 ml en 7 colores · Incluye DTF UV',
    description:
      'Botella deportiva publicitaria de 750 ml con amplia área de marcaje full color en DTF UV. Tu marca en productos útiles listos para destacar.',
    dimensions: '750 ml · Boca ancha',
    material: 'Polímero resistente + tapa rosca chupón + DTF UV',
    leadTimeDays: '3 a 5 días hábiles',
    shape: 'photo-product',
    minOrderQty: 100,
    fullColorSurcharge: 0,
    realImageUrl: '/catalog/cooler-publicitario-dtf.jpg',
    priceNote: 'Mínimo 100 uds · $2.15 c/u · Incluye DTF UV',
    printArea: {
      cx: 270,
      cy: 300,
      width: 170,
      height: 150,
      physicalLabel: 'DTF UV alta definición',
      guideShape: 'rounded-rect',
    },
    colors: [
      { id: 'rojo', name: 'Rojo', hex: '#DC2127', stock: 1500, available: true },
      { id: 'gris', name: 'Gris', hex: '#64748B', stock: 1400, available: true },
      { id: 'translucido', name: 'Translúcido', hex: '#E2E8F0', stock: 1600, available: true },
      { id: 'azul', name: 'Azul', hex: '#154EC2', stock: 2200, available: true, badge: 'Popular' },
      { id: 'amarillo', name: 'Amarillo', hex: '#FACC15', stock: 1300, available: true },
      { id: 'negro', name: 'Negro', hex: '#141519', stock: 2500, available: true, badge: 'Top ventas' },
      { id: 'blanco', name: 'Blanco', hex: '#F8FAFC', stock: 1900, available: true },
    ],
    priceTiers: [
      { minQty: 100, unitPrice: 2.15, promoLabel: 'Mínimo 100 uds' },
    ],
    highlights: [
      '7 colores corporativos disponibles en stock',
      'Incluye personalización DTF UV ($2.15 c/u)',
      'Capacidad 750 ml · Mínimo 100 unidades',
    ],
  },
  {
    id: 'cooler-publicitario-750-serigrafia',
    sku: 'POP-COL-750S',
    name: 'Cooler Publicitario 750 ml (Serigrafía)',
    shortName: 'Cooler 750ml Serigrafía',
    category: 'Coolers',
    tagline: 'Acabado corporativo en serigrafía directa · 750 ml',
    description:
      'Cooler corporativo de 750 ml en acabado mate elegante (Negro o Blanco) con estampado en serigrafía directa de ultra durabilidad para empresas y marcas.',
    dimensions: '750 ml · Acabado mate',
    material: 'Polímero mate premium + serigrafía directa',
    leadTimeDays: '4 a 6 días hábiles',
    shape: 'photo-product',
    minOrderQty: 150,
    fullColorSurcharge: 0,
    realImageUrl: '/catalog/cooler-publicitario-serigrafia.jpg',
    priceNote: 'Mínimo 150 uds · $2.50 c/u · Incluye serigrafía',
    printArea: {
      cx: 270,
      cy: 310,
      width: 165,
      height: 150,
      physicalLabel: 'Serigrafía frontal',
      guideShape: 'rounded-rect',
    },
    colors: [
      { id: 'negro', name: 'Negro', hex: '#141519', stock: 2800, available: true, badge: 'Corporativo' },
      { id: 'blanco', name: 'Blanco', hex: '#F8FAFC', stock: 2100, available: true },
    ],
    priceTiers: [
      { minQty: 150, unitPrice: 2.50, promoLabel: 'Mínimo 150 uds' },
    ],
    highlights: [
      'Incluye impresión profesional en serigrafía ($2.50 c/u)',
      'Colores sobrios de alto impacto: Negro y Blanco',
      'Capacidad 750 ml · Pedido mínimo 150 unidades',
    ],
  },
  {
    id: 'vasos-licoreros',
    sku: 'POP-VAS-LIC',
    name: 'Vasos Licoreros Personalizados',
    shortName: 'Vasos Licoreros',
    category: 'Vasos y Papelería',
    tagline: 'El favorito de restaurantes, barras y fiestas · Incluye 1 estampado',
    description:
      'Vasos licoreros reutilizables personalizados con tu logotipo, red social y QR/teléfono. Alto impacto en activaciones nocturnas, bodas y locales gastronómicos.',
    dimensions: '12 oz · Reutilizable brillante',
    material: 'Polipropileno rígido brillante + estampado 1 tinta',
    leadTimeDays: '3 a 5 días hábiles',
    shape: 'photo-product',
    minOrderQty: 200,
    fullColorSurcharge: 0,
    realImageUrl: '/catalog/vasos-licoreros.jpg',
    priceNote: 'Mínimo 200 uds · $0.70 c/u · Incluye 1 estampado',
    printArea: {
      cx: 295,
      cy: 295,
      width: 155,
      height: 155,
      physicalLabel: 'Estampado frontal 1 tinta',
      guideShape: 'rounded-rect',
    },
    colors: [
      { id: 'negro', name: 'Negro', hex: '#141519', stock: 5000, available: true, badge: 'Top ventas' },
      { id: 'blanco', name: 'Blanco', hex: '#F8FAFC', stock: 3500, available: true },
      { id: 'fucsia', name: 'Fucsia Neón', hex: '#F72585', stock: 2400, available: true },
      { id: 'verde-lima', name: 'Verde Neón', hex: '#A3E635', stock: 2200, available: true },
    ],
    priceTiers: [
      { minQty: 200, unitPrice: 0.70, promoLabel: 'Mínimo 200 uds' },
    ],
    highlights: [
      'Súper rentable: $0.70 c/u desde 200 unidades',
      'Incluye 1 estampado nítido de tu marca',
      'Ideal para restaurantes, barras, eventos y bodas',
    ],
  },
  {
    id: 'block-de-notas',
    sku: 'POP-BLK-NOT',
    name: 'Block de Notas Espiral Personalizado',
    shortName: 'Block de Notas',
    category: 'Vasos y Papelería',
    tagline: 'Portada e interiores con tu identidad de marca · Espiral metálico',
    description:
      'Block de notas corporativo con portada personalizada a todo color, hojas interiores con logo y encuadernado doble anillo metálico. Ideal para congresos y ejecutivos.',
    dimensions: '14 × 20 cm (Media carta)',
    material: 'Portada rígida laminada + hojas personalizadas + espiral',
    leadTimeDays: '4 a 6 días hábiles',
    shape: 'photo-product',
    minOrderQty: 50,
    fullColorSurcharge: 0,
    realImageUrl: '/catalog/block-de-notas.jpg',
    priceNote: 'Mínimo 50 uds · $5.00 c/u',
    printArea: {
      cx: 245,
      cy: 290,
      width: 180,
      height: 185,
      physicalLabel: 'Portada full color + hojas',
      guideShape: 'rounded-rect',
    },
    colors: [
      { id: 'blanco', name: 'Blanco Full Color', hex: '#FFFFFF', stock: 1200, available: true, badge: 'Corporativo' },
      { id: 'negro', name: 'Negro Mate', hex: '#141519', stock: 900, available: true },
    ],
    priceTiers: [
      { minQty: 50, unitPrice: 5.00, promoLabel: 'Mínimo 50 uds' },
    ],
    highlights: [
      'Portada full color + hojas interiores membretadas con tu logo',
      'Encuadernación espiral metálico doble O resistente',
      'Pedido mínimo desde 50 unidades ($5.00 c/u)',
    ],
  },
  {
    id: 'abanico-convencional-plegable',
    sku: 'POP-AB-CONV42',
    name: 'Abanico Convencional Plegable (13 Varillas)',
    shortName: 'Abanico Convencional',
    category: 'Abanicos',
    tagline: 'Clásico abanico de mano plegable con varillas personalizables',
    description:
      'Clásico abanico de mano con 13 varillas resistentes y pantalla en tela poliéster de textura fina. Elegante para eventos corporativos, bodas y regalos premium.',
    dimensions: '42 × 23 cm abierto',
    material: 'Tela Poliéster 210D + Varillas PP / Bambú',
    leadTimeDays: '4 a 6 días hábiles',
    shape: 'conventional-fan',
    minOrderQty: 100,
    fullColorSurcharge: 0.25,
    printArea: {
      cx: 350,
      cy: 162,
      width: 240,
      height: 112,
      physicalLabel: '18 × 8.5 cm (arco central)',
      guideShape: 'arc',
    },
    colors: [
      { id: 'blanco', name: 'Blanco Puro', hex: '#F7F8FA', stock: 1500, available: true, badge: 'Eventos' },
      { id: 'negro', name: 'Negro Ébano', hex: '#18181B', stock: 1200, available: true },
      { id: 'azul-rey', name: 'Azul Rey', hex: '#154EC2', stock: 1150, available: true },
      { id: 'rojo', name: 'Rojo Carmesí', hex: '#DC2127', stock: 950, available: true },
      { id: 'fucsia', name: 'Fucsia', hex: '#F72585', stock: 850, available: true },
      { id: 'morado', name: 'Morado', hex: '#6D1CC7', stock: 820, available: true },
    ],
    secondaryLabel: 'Varillas y Mango',
    secondaryOptions: [
      { id: 'match', name: 'Al tono', hex: 'MATCH', stock: 5000, available: true },
      { id: 'bambu', name: 'Bambú Natural', hex: '#D4B07A', stock: 1400, available: true },
      { id: 'blanco', name: 'Blanco Mate', hex: '#F1F5F9', stock: 3000, available: true },
      { id: 'negro', name: 'Negro Ébano', hex: '#1E293B', stock: 2600, available: true },
    ],
    priceTiers: [
      { minQty: 100, unitPrice: 1.65 },
      { minQty: 250, unitPrice: 1.48, promoLabel: '-10% Evento' },
      { minQty: 500, unitPrice: 1.35, promoLabel: '-18% Corporativo' },
      { minQty: 1000, unitPrice: 1.20, promoLabel: 'Mayorista' },
    ],
    highlights: [
      'Varillas disponibles al tono, en blanco, negro o bambú natural',
      'Pliegues nítidos que mantienen la legibilidad de tu logo',
      'Mockup interactivo en vivo con vista abierta, plegada y 3D',
    ],
  },
];

export const CUSTOM_INK_PRESETS = [
  { name: 'Dorado Metálico', hex: '#D4AF37' },
  { name: 'Plata Metálico', hex: '#C0C6D0' },
  { name: 'Violeta .colorío', hex: '#4C1EDB' },
  { name: 'Magenta POP', hex: '#F72585' },
  { name: 'Lima .colorío', hex: '#C0EE00' },
  { name: 'Azul Corporativo', hex: '#1D4ED8' },
];

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

export const DEMO_LOGOS: LogoAsset[] = [
  {
    id: 'demo-solaris',
    name: 'SOLARIS_EVENTOS.svg',
    isVector: true,
    aspectRatio: 1.35,
    removeWhiteBg: false,
    originalUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 270 200">
        <g fill="#0F172A">
          <circle cx="135" cy="70" r="22"/>
          <path d="M135 20v16M135 104v16M85 70h16M169 70h16M99.6 34.6l11.3 11.3M159.1 94.1l11.3 11.3M170.4 34.6l-11.3 11.3M110.9 94.1l-11.3 11.3" stroke="#0F172A" stroke-width="7.5" stroke-linecap="round"/>
          <text x="135" y="156" text-anchor="middle" font-family="Plus Jakarta Sans, Arial, sans-serif" font-weight="800" font-size="36" letter-spacing="4">SOLARIS</text>
          <text x="135" y="180" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="700" font-size="13" letter-spacing="5" opacity="0.82">FESTIVAL 2026</text>
        </g>
      </svg>
    `),
  },
  {
    id: 'demo-cafe',
    name: 'CAFE_ALTURA.svg',
    isVector: true,
    aspectRatio: 1.0,
    removeWhiteBg: false,
    originalUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220">
        <circle cx="110" cy="110" r="96" fill="none" stroke="#1E293B" stroke-width="6"/>
        <circle cx="110" cy="110" r="84" fill="none" stroke="#D97706" stroke-width="2.5" stroke-dasharray="6 5"/>
        <path d="M56 122 L92 68 L116 102 L134 78 L166 122 Z" fill="#1E293B"/>
        <path d="M92 68 L104 86 L92 82 L83 88 Z" fill="#F59E0B"/>
        <text x="110" y="152" text-anchor="middle" font-family="Plus Jakarta Sans, Arial, sans-serif" font-weight="800" font-size="25" letter-spacing="4" fill="#1E293B">ALTURA</text>
        <text x="110" y="172" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="600" font-size="11" letter-spacing="4" fill="#B45309">ORIGEN · CAFÉ</text>
      </svg>
    `),
  },
  {
    id: 'demo-nova',
    name: 'NOVA_BRAND.svg',
    isVector: true,
    aspectRatio: 1.55,
    removeWhiteBg: false,
    originalUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 310 200">
        <rect x="24" y="42" width="72" height="72" rx="20" fill="#4C1EDB"/>
        <path d="M46 92V64l28 28V64" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="80" cy="56" r="6" fill="#C0EE00"/>
        <text x="114" y="88" font-family="Plus Jakarta Sans, Arial, sans-serif" font-weight="800" font-size="44" letter-spacing="-1" fill="#0F172A">nova</text>
        <text x="116" y="114" font-family="Inter, Arial, sans-serif" font-weight="700" font-size="13" letter-spacing="5" fill="#4C1EDB">BRAND LAB</text>
        <rect x="24" y="136" width="262" height="5" rx="2.5" fill="#4C1EDB" opacity="0.22"/>
        <rect x="24" y="136" width="110" height="5" rx="2.5" fill="#F72585"/>
      </svg>
    `),
  },
];

export function getUnitPrice(
  product: Product,
  quantity: number,
  inkMode: InkMode,
  pouchPrint = false,
  coverage: PrintCoverage = 'centered',
  techniqueId: PrintTechniqueId = 'vinil-plano',
  secondaryOption?: SecondaryOption
): number {
  let base: number;
  if (secondaryOption?.unitPriceOverride !== undefined) {
    base = secondaryOption.unitPriceOverride;
  } else {
    const sortedTiers = [...product.priceTiers].sort((a, b) => a.minQty - b.minQty);
    base = sortedTiers[0]?.unitPrice ?? 1.25;
    for (const tier of sortedTiers) {
      if (quantity >= tier.minQty) {
        base = tier.unitPrice;
      }
    }
  }

  const tech = getTechniqueById(techniqueId);
  const techSurcharge =
    product.fullColorSurcharge === 0 && techniqueId === 'full-color'
      ? 0
      : techniqueId === 'full-color'
        ? product.fullColorSurcharge
        : tech.surchargePerUnit;
  const pouchSurcharge = pouchPrint && product.hasPouch ? product.pouchPrintSurcharge || 0 : 0;
  const fullBleedSurcharge = coverage === 'full-bleed' && product.supportsFullBleed ? 0.14 : 0;
  const extraFull =
    inkMode === 'full' && techniqueId === 'vinil-plano' ? product.fullColorSurcharge : 0;
  return Number((base + techSurcharge + extraFull + pouchSurcharge + fullBleedSurcharge).toFixed(2));
}

export function getNextTierHint(
  product: Product,
  quantity: number,
  inkMode: InkMode,
  pouchPrint = false,
  coverage: PrintCoverage = 'centered',
  techniqueId: PrintTechniqueId = 'vinil-plano',
  secondaryOption?: SecondaryOption
): { needed: number; nextMinQty: number; nextUnitPrice: number; promoLabel?: string } | null {
  if (secondaryOption?.unitPriceOverride !== undefined) return null;
  const sortedTiers = [...product.priceTiers].sort((a, b) => a.minQty - b.minQty);
  for (const tier of sortedTiers) {
    if (tier.minQty > quantity) {
      const nextUnitPrice = getUnitPrice(
        product,
        tier.minQty,
        inkMode,
        pouchPrint,
        coverage,
        techniqueId,
        secondaryOption
      );
      return {
        needed: tier.minQty - quantity,
        nextMinQty: tier.minQty,
        nextUnitPrice,
        promoLabel: tier.promoLabel,
      };
    }
  }
  return null;
}

export function calculateCouponDiscount(
  coupon: Coupon | null,
  subtotal: number
): { valid: boolean; discount: number; reason?: string } {
  if (!coupon) return { valid: false, discount: 0 };
  if (!coupon.active) {
    return { valid: false, discount: 0, reason: 'Este cupón está inactivo.' };
  }
  if (subtotal < coupon.minSubtotal) {
    return {
      valid: false,
      discount: 0,
      reason: `Monto mínimo requerido: ${formatCurrency(coupon.minSubtotal)}.`,
    };
  }
  const raw =
    coupon.type === 'percent' ? (subtotal * coupon.value) / 100 : coupon.value;
  return {
    valid: true,
    discount: Number(Math.min(subtotal, Math.max(0, raw)).toFixed(2)),
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function getLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return 0.5;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const toLin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

export function getInkContrastWarning(
  baseHex: string,
  inkMode: InkMode,
  customInkHex: string
): string | null {
  const baseLum = getLuminance(baseHex);
  if (inkMode === 'white' && baseLum > 0.76) {
    return 'Tinta blanca sobre base clara tendrá muy bajo contraste. Prueba tinta negra o full color.';
  }
  if (inkMode === 'black' && baseLum < 0.09) {
    return 'Tinta negra sobre base oscura apenas se verá. Te recomendamos tinta blanca o dorada.';
  }
  if (inkMode === 'custom') {
    const inkLum = getLuminance(customInkHex);
    const ratio = (Math.max(baseLum, inkLum) + 0.05) / (Math.min(baseLum, inkLum) + 0.05);
    if (ratio < 1.8) {
      return 'El color de tinta es muy similar al color de la base. Considera aumentar el contraste.';
    }
  }
  return null;
}

export function getInkLabel(inkMode: InkMode, customHex?: string): string {
  switch (inkMode) {
    case 'full':
      return 'Full Color';
    case 'white':
      return 'Blanco (1 tinta)';
    case 'black':
      return 'Negro (1 tinta)';
    case 'custom':
      return `1 Tinta (${customHex || '#D4AF37'})`;
  }
}
