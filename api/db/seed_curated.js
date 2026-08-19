/**
 * PaDonde — Seed Curado con Tags Enriquecidos según Reseñas y Opiniones de Usuarios
 *
 * Incluye etiquetas de gastronomía, ambiente, ocasión y servicios basadas en la
 * valoración promedio y comentarios frecuentes de los usuarios.
 */

import "dotenv/config";
import pool from "./db.js";

// ── Catálogo Ampliado de Tags ──────────────────────────────────────────────
const TAGS = [
  "romantico",
  "para_citas",
  "chill",
  "terraza",
  "cocteleria",
  "cocteleria_autor",
  "vinos_selectos",
  "musica_en_vivo",
  "dj_en_vivo",
  "jazz_en_vivo",
  "para_amigos",
  "para_trabajar",
  "familiar",
  "wifi",
  "parking",
  "valet_parking",
  "desayuno",
  "brunch",
  "brunch_top",
  "vegano",
  "vistas",
  "vistas_espectaculares",
  "gourmet",
  "elegante",
  "exclusivo",
  "ambiente_sofisticado",
  "ambiente_acogedor",
  "ambiente_festivo",
  "buen_servicio",
  "reunion_negocios",
  "cumpleanos",
  "afterwork",
  "comida_italiana",
  "comida_asiatica",
  "comida_mariscos",
  "cortes_de_carne",
  "comida_criolla_gourmet",
  "rock"
];

// ── Lista Curada con Tags Basados en Reseñas de Clientes ──────────────────
const PLACES = [
  // ── RESTAURANTES DE ALTA COCINA Y ELEGANTES ──────────────────────────────
  {
    name: "Bottega Fratelli",
    type: "restaurant",
    lat: 18.4638, lng: -69.9306,
    avg_price: 4,
    tags: ["elegante", "para_citas", "comida_italiana", "gourmet", "exclusivo", "vinos_selectos", "valet_parking", "reunion_negocios", "buen_servicio"],
    details: {
      description: "Alta cocina italiana y mediterránea alabada por su ambiente sofisticado, excelente atención y pulpo a la brasa memorable.",
      instagram: "@bottegafratelli",
      website: "https://bottegafratelli.com",
      schedule: "Mar–Sáb 12:00 PM – 11:30 PM, Dom 12:00 PM – 10:00 PM",
      phone: "809-562-6767",
      address: "C/ Pablo Casals 19, Piantini, Santo Domingo"
    }
  },
  {
    name: "SBG Sophia's Bar & Grill",
    type: "restaurant",
    lat: 18.4682, lng: -69.9392,
    avg_price: 4,
    tags: ["elegante", "exclusivo", "cortes_de_carne", "cocteleria_autor", "valet_parking", "reunion_negocios", "ambiente_sofisticado", "buen_servicio"],
    details: {
      description: "Icono de la gastronomía de lujo. Reseñado constantemente por su ambiente chic, ribeye prémium y cócteles excepcionales.",
      instagram: "@sbg_rd",
      website: "https://sbg.com.do",
      schedule: "Lun–Dom 12:00 PM – 12:00 AM",
      phone: "809-955-3000",
      address: "BlueMall, Nivel 1, Av. Winston Churchill, Santo Domingo"
    }
  },
  {
    name: "Peperoni",
    type: "restaurant",
    lat: 18.4665, lng: -69.9312,
    avg_price: 3,
    tags: ["elegante", "para_citas", "terraza", "comida_mariscos", "vinos_selectos", "valet_parking", "cumpleanos", "buen_servicio"],
    details: {
      description: "Destacado por sus clientes por el fabuloso jardín interior con terraza, risotto de mariscos y atención de primera clase.",
      instagram: "@peperonird",
      website: "https://peperoni.com.do",
      schedule: "Lun–Dom 12:00 PM – 11:30 PM",
      phone: "809-565-2200",
      address: "C/ Federico Geraldino 98, Piantini, Santo Domingo"
    }
  },
  {
    name: "Laurel Food & Wine",
    type: "restaurant",
    lat: 18.4678, lng: -69.9341,
    avg_price: 3,
    tags: ["gourmet", "terraza", "afterwork", "para_amigos", "valet_parking", "brunch_top", "ambiente_acogedor"],
    details: {
      description: "Recomendado ampliamente para afterwork y reuniones de amigos. Destacan sus pizzas en horno de leña y tapas creativas.",
      instagram: "@laurelrd",
      website: "https://laurel.com.do",
      schedule: "Lun–Dom 12:00 PM – 11:30 PM",
      phone: "809-549-7433",
      address: "C/ Andrés Julio Aybar 16, Piantini, Santo Domingo"
    }
  },
  {
    name: "Pat'e Palo European Brasserie",
    type: "restaurant",
    lat: 18.4729, lng: -69.8843,
    avg_price: 4,
    tags: ["para_citas", "vistas_espectaculares", "gourmet", "terraza", "elegante", "ambiente_acogedor", "buen_servicio"],
    details: {
      description: "Favorito para cenas románticas frente a la Plaza de España. Los usuarios destacan el chivo al vino y la vista colonial nocturna.",
      instagram: "@patepalo.rd",
      website: "https://patepalo.com",
      schedule: "Lun–Dom 12:00 PM – 12:00 AM",
      phone: "809-687-8089",
      address: "Plaza de España, La Atarazana 25, Zona Colonial, Santo Domingo"
    }
  },
  {
    name: "Mesón de la Cava",
    type: "restaurant",
    lat: 18.4714, lng: -69.9404,
    avg_price: 4,
    tags: ["para_citas", "exclusivo", "vistas_espectaculares", "musica_en_vivo", "cortes_de_carne", "valet_parking"],
    details: {
      description: "Experiencia única al cenar dentro de una cueva natural. Opiniones resaltan la atmósfera mágica para aniversarios y el salmón al eneldo.",
      instagram: "@mesondelacava",
      website: "https://mesondelacava.com",
      schedule: "Mar–Dom 12:00 PM – 11:30 PM",
      phone: "809-533-2818",
      address: "Av. Mirador del Sur 1, Bella Vista, Santo Domingo"
    }
  },
  {
    name: "Maraca",
    type: "restaurant",
    lat: 18.4722, lng: -69.8878,
    avg_price: 3,
    tags: ["gourmet", "cocteleria_autor", "elegante", "para_citas", "dj_en_vivo", "ambiente_sofisticado"],
    details: {
      description: "Muy elogiado por su decoración Art Déco tropical, tragos creativos en la barra y platillos con sazón caribeña estilizada.",
      instagram: "@maracard",
      schedule: "Lun–Dom 12:00 PM – 11:30 PM",
      phone: "809-682-1926",
      address: "C/ Arzobispo Meriño 206, Zona Colonial, Santo Domingo"
    }
  },
  {
    name: "Filigrana Ristorante",
    type: "restaurant",
    lat: 18.4577, lng: -69.9100,
    avg_price: 4,
    tags: ["elegante", "vistas_espectaculares", "para_citas", "comida_mariscos", "valet_parking", "buen_servicio"],
    details: {
      description: "Reseñas destacan la vista panorámica del piso 5 del InterContinental y las parrillas de mariscos y carnes estilo español.",
      instagram: "@filigranard",
      schedule: "Mar–Dom 12:00 PM – 11:00 PM",
      phone: "809-688-7777",
      address: "Av. Winston Churchill esq. Porfirio Díaz, Piantini, Santo Domingo"
    }
  },
  {
    name: "Vesuvio Ristorante Malecón",
    type: "restaurant",
    lat: 18.4608, lng: -69.9297,
    avg_price: 3,
    tags: ["familiar", "comida_italiana", "vistas", "buen_servicio", "valet_parking"],
    details: {
      description: "Comentarios elogian su atención tradicional, calamares fritos y linguine a las almejas frente al mar.",
      instagram: "@vesuvio.rd",
      website: "https://vesuvio.com.do",
      schedule: "Lun–Dom 12:00 PM – 11:00 PM",
      phone: "809-221-3333",
      address: "Av. George Washington 521, Santo Domingo"
    }
  },
  {
    name: "Nipau Grill & Restaurant",
    type: "restaurant",
    lat: 18.4641, lng: -69.9322,
    avg_price: 3,
    tags: ["gourmet", "elegante", "reunion_negocios", "cortes_de_carne", "valet_parking", "buen_servicio"],
    details: {
      description: "Valorado en reseñas como uno de los mejores bistrós contemporáneos por su risottos y lomo en salsa de hongos.",
      instagram: "@nipaurd",
      schedule: "Lun–Sáb 12:00 PM – 11:30 PM",
      phone: "809-540-3528",
      address: "C/ Max Henríquez Ureña 20, Piantini, Santo Domingo"
    }
  },
  {
    name: "La Cassina",
    type: "restaurant",
    lat: 18.4658, lng: -69.9348,
    avg_price: 4,
    tags: ["elegante", "exclusivo", "para_citas", "cocteleria_autor", "valet_parking", "ambiente_sofisticado"],
    details: {
      description: "Frecuentado por la alta sociedad. Los comensales alaban la terraza chic, pasta artesanal y cócteles de gin.",
      instagram: "@lacassinard",
      schedule: "Lun–Sáb 12:00 PM – 11:30 PM",
      phone: "809-363-4444",
      address: "Av. Roberto Pastoriza 504, Piantini, Santo Domingo"
    }
  },
  {
    name: "Central Gastronómica",
    type: "restaurant",
    lat: 18.4649, lng: -69.9329,
    avg_price: 3,
    tags: ["gourmet", "afterwork", "para_amigos", "terraza", "valet_parking", "buen_servicio"],
    details: {
      description: "Muy popular para tapeo y bebidas entre amigos. Mencionan frecuentemente sus hamburguesas gourmet y croquetas.",
      instagram: "@centralgastronomica",
      schedule: "Lun–Dom 12:00 PM – 11:00 PM",
      phone: "809-563-7171",
      address: "C/ Agustín Lara 17, Piantini, Santo Domingo"
    }
  },
  {
    name: "Ajuala",
    type: "restaurant",
    lat: 18.4632, lng: -69.9295,
    avg_price: 4,
    tags: ["gourmet", "exclusivo", "para_citas", "ambiente_sofisticado", "buen_servicio"],
    details: {
      description: "Calificado como experiencia gastronómica imprescindible. Menú degustación con producto local elevado a nivel internacional.",
      instagram: "@ajualard",
      website: "https://ajuala.com",
      schedule: "Mar–Sáb 12:30 PM – 10:30 PM",
      phone: "809-567-2000",
      address: "C/ Andrés Julio Aybar 23, Piantini, Santo Domingo"
    }
  },
  {
    name: "Samurai Japanese Restaurant",
    type: "restaurant",
    lat: 18.4660, lng: -69.9315,
    avg_price: 3,
    tags: ["comida_asiatica", "gourmet", "elegante", "para_citas", "valet_parking"],
    details: {
      description: "El referente japonés auténtico según la opinión del público. Sashimi súper fresco, tempura y teppanyaki impecable.",
      instagram: "@samuraird",
      schedule: "Lun–Dom 12:00 PM – 11:00 PM",
      phone: "809-565-1621",
      address: "C/ Seminario 57, Piantini, Santo Domingo"
    }
  },
  {
    name: "Shibuya Ichiban",
    type: "restaurant",
    lat: 18.4682, lng: -69.9392,
    avg_price: 3,
    tags: ["comida_asiatica", "cocteleria_autor", "chill", "para_amigos", "brunch_top"],
    details: {
      description: "Reseñas destacan los rolls de autor y los bao buns con cócteles asiáticos en la terraza de BlueMall.",
      instagram: "@shibuyard",
      schedule: "Lun–Dom 12:00 PM – 11:00 PM",
      phone: "809-955-0300",
      address: "BlueMall, Nivel 5, Av. Winston Churchill, Santo Domingo"
    }
  },
  {
    name: "El Conuco",
    type: "restaurant",
    lat: 18.4631, lng: -69.9215,
    avg_price: 2,
    tags: ["comida_criolla_gourmet", "familiar", "musica_en_vivo", "terraza", "buen_servicio"],
    details: {
      description: "Recomendación número 1 para visitantes que buscan chivo liniero, sancocho y shows de baile folclórico animado.",
      instagram: "@elconuco.rd",
      schedule: "Lun–Dom 12:00 PM – 11:00 PM",
      phone: "809-686-0129",
      address: "C/ Casimiro de Moya 152, Gazcue, Santo Domingo"
    }
  },
  {
    name: "Adrian Tropical Lincoln",
    type: "restaurant",
    lat: 18.4711, lng: -69.9310,
    avg_price: 2,
    tags: ["comida_criolla_gourmet", "familiar", "terraza", "valet_parking", "afterwork"],
    details: {
      description: "Infaltable para mofongos a cualquier hora de la noche. Opiniones resaltan el mofongo mixto y el caldo de chivo.",
      instagram: "@adriantropical",
      schedule: "Abierto 24 horas",
      phone: "809-565-9236",
      address: "Av. Abraham Lincoln 803, Santo Domingo"
    }
  },
  {
    name: "Jalao",
    type: "restaurant",
    lat: 18.4739, lng: -69.8840,
    avg_price: 3,
    tags: ["comida_criolla_gourmet", "musica_en_vivo", "familiar", "cocteleria", "vistas_espectaculares"],
    details: {
      description: "Muy popular en reseñas turísticas y locales por sus orquestas en vivo frente al Parque Colón y platos típicos de autor.",
      instagram: "@jalaord",
      schedule: "Lun–Dom 12:00 PM – 12:00 AM",
      phone: "809-689-9500",
      address: "C/ El Conde 101, Parque Colón, Zona Colonial, Santo Domingo"
    }
  },
  {
    name: "Cantábrico Ristorante",
    type: "restaurant",
    lat: 18.4680, lng: -69.9210,
    avg_price: 4,
    tags: ["comida_mariscos", "elegante", "exclusivo", "reunion_negocios", "valet_parking", "buen_servicio"],
    details: {
      description: "Considerado un templo de la cocina marinera y la paella en Santo Domingo con atención distinguida.",
      instagram: "@cantabricord",
      schedule: "Lun–Dom 12:00 PM – 11:00 PM",
      phone: "809-687-5101",
      address: "Av. Enrique Jiménez Moya 40, Santo Domingo"
    }
  },
  {
    name: "Il Barcaiolo",
    type: "restaurant",
    lat: 18.4650, lng: -69.9330,
    avg_price: 3,
    tags: ["comida_italiana", "para_citas", "gourmet", "ambiente_acogedor"],
    details: {
      description: "Elogiado por su pasta ravioli artesanal y tiramisú tradicional preparado como en Italia.",
      instagram: "@ilbarcaiolord",
      schedule: "Mar–Dom 12:00 PM – 10:30 PM",
      phone: "809-540-8899",
      address: "C/ Max Henríquez Ureña 32, Piantini, Santo Domingo"
    }
  },
  {
    name: "Mamma Luisa",
    type: "restaurant",
    lat: 18.4705, lng: -69.9270,
    avg_price: 3,
    tags: ["comida_italiana", "familiar", "para_citas", "ambiente_acogedor"],
    details: {
      description: "Los clientes adoran el trato cercano de Mamma Luisa y su famosa salsa bolognesa casera.",
      instagram: "@mammaluisard",
      schedule: "Lun–Dom 12:00 PM – 11:00 PM",
      phone: "809-565-4011",
      address: "C/ Federico Geraldino 43, Naco, Santo Domingo"
    }
  },
  {
    name: "Luiggi Ristorante",
    type: "restaurant",
    lat: 18.4670, lng: -69.9350,
    avg_price: 3,
    tags: ["comida_italiana", "para_citas", "elegante", "vinos_selectos"],
    details: {
      description: "Reseñas destacan sus ñoquis de cuatro quesos y ambiente íntimo para veladas tranquilas.",
      instagram: "@luiggiristorante",
      schedule: "Lun–Dom 12:00 PM – 11:00 PM",
      phone: "809-563-1222",
      address: "C/ Andrés Julio Aybar 12, Piantini, Santo Domingo"
    }
  },
  {
    name: "Mitre Restaurant & Cigar Lounge",
    type: "restaurant",
    lat: 18.4720, lng: -69.9312,
    avg_price: 4,
    tags: ["elegante", "exclusivo", "cocteleria_autor", "valet_parking", "reunion_negocios"],
    details: {
      description: "Punto de encuentro de ejecutivos y amantes del buen tabaco. Platos de autor y maridaje de rones prémium.",
      instagram: "@mitrerd",
      schedule: "Lun–Sáb 12:00 PM – 12:00 AM",
      phone: "809-563-0808",
      address: "Av. Abraham Lincoln esq. Gustavo Mejía Ricart, Santo Domingo"
    }
  },
  {
    name: "El Agave Piantini",
    type: "restaurant",
    lat: 18.4660, lng: -69.9340,
    avg_price: 2,
    tags: ["familiar", "para_amigos", "cocteleria", "cumpleanos"],
    details: {
      description: "Famoso por su guacamole preparado en la mesa y margaritas gigantes para celebrar cumpleaños.",
      instagram: "@elagaverd",
      schedule: "Lun–Dom 12:00 PM – 11:00 PM",
      phone: "809-567-4283",
      address: "C/ Manuel de Jesús Troncoso 34, Piantini, Santo Domingo"
    }
  },
  {
    name: "La Dolcerie Next Door",
    type: "restaurant",
    lat: 18.4700, lng: -69.9300,
    avg_price: 2,
    tags: ["brunch_top", "desayuno", "para_citas", "chill", "ambiente_acogedor"],
    details: {
      description: "Favorito del público femenino para brunches de fin de semana, red velvet cake y tostadas francesas.",
      instagram: "@ladolcerie",
      schedule: "Lun–Dom 8:00 AM – 10:00 PM",
      phone: "809-541-0011",
      address: "Av. Roberto Pastoriza 319, Naco, Santo Domingo"
    }
  },
  {
    name: "P.F. Chang's Santo Domingo",
    type: "restaurant",
    lat: 18.4682, lng: -69.9392,
    avg_price: 3,
    tags: ["comida_asiatica", "familiar", "para_amigos", "valet_parking"],
    details: {
      description: "Muy valorado por sus Lettuce Wraps de pollo y el ambiente familiar en BlueMall.",
      instagram: "@pfchangsrd",
      schedule: "Lun–Dom 12:00 PM – 11:00 PM",
      phone: "809-955-7324",
      address: "BlueMall, Nivel 1, Av. Winston Churchill, Santo Domingo"
    }
  },
  {
    name: "Hard Rock Cafe Santo Domingo",
    type: "restaurant",
    lat: 18.4682, lng: -69.9392,
    avg_price: 3,
    tags: ["musica_en_vivo", "rock", "para_amigos", "cumpleanos", "valet_parking"],
    details: {
      description: "Opiniones destacan los conciertos de bandas locales y sus hamburguesas al carbón.",
      instagram: "@hrcsantodomingo",
      schedule: "Lun–Dom 12:00 PM – 12:00 AM",
      phone: "809-686-7771",
      address: "BlueMall, Nivel 4, Av. Winston Churchill, Santo Domingo"
    }
  },
  {
    name: "Cava Alta",
    type: "restaurant",
    lat: 18.4655, lng: -69.9318,
    avg_price: 4,
    tags: ["vinos_selectos", "exclusivo", "elegante", "para_citas", "reunion_negocios"],
    details: {
      description: "Templo del vino en Santo Domingo. Catas guiadas, quesos artesanales y jamón ibérico de bellota.",
      instagram: "@cavaaltard",
      schedule: "Lun–Sáb 11:00 AM – 11:00 PM",
      phone: "809-563-3131",
      address: "C/ Agustín Lara 19, Piantini, Santo Domingo"
    }
  },
  {
    name: "Buche Perico",
    type: "restaurant",
    lat: 18.4735, lng: -69.8855,
    avg_price: 3,
    tags: ["para_citas", "terraza", "comida_criolla_gourmet", "ambiente_acogedor"],
    details: {
      description: "Jardín botánico interior espectacular. Los clientes recomiendan el chicharrón de chivo y el cocktail de la casa.",
      instagram: "@bucheperico",
      schedule: "Mar–Dom 12:00 PM – 11:00 PM",
      phone: "809-688-6699",
      address: "C/ El Conde 53, Zona Colonial, Santo Domingo"
    }
  },
  {
    name: "Lulú Tasting Bar",
    type: "restaurant",
    lat: 18.4725, lng: -69.8845,
    avg_price: 3,
    tags: ["para_citas", "terraza", "cocteleria_autor", "afterwork", "chill"],
    details: {
      description: "Ideal para tapear bajo los árboles del patio colonial. Mencionan sus sliders de chivo y sangrías de autor.",
      instagram: "@lulutastingbar",
      schedule: "Mar–Dom 5:00 PM – 12:00 AM",
      phone: "809-687-8300",
      address: "C/ Padre Billini esq. Arzobispo Meriño, Zona Colonial, Santo Domingo"
    }
  },
  {
    name: "Casa Catedral",
    type: "restaurant",
    lat: 18.4731, lng: -69.8835,
    avg_price: 3,
    tags: ["vistas_espectaculares", "para_citas", "terraza", "elegante"],
    details: {
      description: "Excelente ubicación histórica con vista directa a la primera Catedral de América.",
      instagram: "@casacatedralrd",
      schedule: "Lun–Dom 12:00 PM – 11:00 PM",
      phone: "809-686-2222",
      address: "C/ Isabel La Católica 161, Zona Colonial, Santo Domingo"
    }
  },
  {
    name: "Osteria da Ciro",
    type: "restaurant",
    lat: 18.4662, lng: -69.9325,
    avg_price: 3,
    tags: ["comida_italiana", "para_citas", "gourmet", "ambiente_acogedor"],
    details: {
      description: "El chef Ciro atiende personalmente a las mesas. Opiniones destacan el carpaccio de pulpo y los espaguetis carbonara auténticos.",
      instagram: "@osteriadaciro",
      schedule: "Lun–Dom 12:00 PM – 11:00 PM",
      phone: "809-540-1010",
      address: "C/ Agustín Lara 24, Piantini, Santo Domingo"
    }
  },
  {
    name: "Don Pepe Ristorante",
    type: "restaurant",
    lat: 18.4712, lng: -69.9285,
    avg_price: 4,
    tags: ["elegante", "comida_mariscos", "reunion_negocios", "valet_parking", "buen_servicio"],
    details: {
      description: "Clásico predilecto para negocios y familias tradicionales. Destacan las cochinillos y mariscos al estilo gallego.",
      instagram: "@donpeperd",
      schedule: "Lun–Sáb 12:00 PM – 11:00 PM",
      phone: "809-563-4440",
      address: "C/ Porfirio Herrera 31, Naco, Santo Domingo"
    }
  },

  // ── BARES & LOUNGES ELEGANTES ─────────────────────────────────────────────
  {
    name: "75 Grados Lounge & Bar",
    type: "bar",
    lat: 18.4750, lng: -69.9280,
    avg_price: 2,
    tags: ["cocteleria_autor", "para_amigos", "ambiente_festivo", "afterwork"],
    details: {
      description: "Famoso en las opiniones por sus tragos helados bajo cero y ambiente animado para arrancar la noche.",
      instagram: "@75gradosbar",
      schedule: "Mié–Dom 6:00 PM – 3:00 AM",
      phone: "809-555-7575",
      address: "C/ Freddy Beras Goico, Naco, Santo Domingo"
    }
  },
  {
    name: "Irish Pub Santo Domingo",
    type: "bar",
    lat: 18.4715, lng: -69.9320,
    avg_price: 2,
    tags: ["para_amigos", "rock", "afterwork", "ambiente_acogedor"],
    details: {
      description: "Reseñas valoran la variedad de cervezas Guinness, hamburguesas jugosas y partidas de dardos entre amigos.",
      instagram: "@irishpubsd",
      schedule: "Lun–Dom 5:00 PM – 2:00 AM",
      phone: "809-555-7788",
      address: "Av. Gustavo Mejía Ricart, Piantini, Santo Domingo"
    }
  },
  {
    name: "Onno's Bar & Lounge Piantini",
    type: "bar",
    lat: 18.4682, lng: -69.9343,
    avg_price: 2,
    tags: ["cocteleria_autor", "para_amigos", "dj_en_vivo", "ambiente_festivo"],
    details: {
      description: "Terraza urbana siempre concurrida. Las opiniones elogian sus mojitos de sabores y la música del DJ.",
      instagram: "@onnos.bar",
      schedule: "Mié–Dom 6:00 PM – 3:00 AM",
      phone: "809-555-0099",
      address: "Av. Abraham Lincoln esq. Gustavo Mejía Ricart, Piantini, Santo Domingo"
    }
  },
  {
    name: "Local37 Rooftop Bar",
    type: "bar",
    lat: 18.4735, lng: -69.8860,
    avg_price: 3,
    tags: ["vistas_espectaculares", "cocteleria_autor", "terraza", "para_citas", "ambiente_sofisticado"],
    details: {
      description: "Uno de los rooftops más aplaudidos de la Zona Colonial por sus atardeceres y coctelería botánica.",
      instagram: "@local37rooftop",
      schedule: "Jue–Dom 6:00 PM – 2:00 AM",
      phone: "809-682-3737",
      address: "C/ Mercedes 37, Zona Colonial, Santo Domingo"
    }
  },
  {
    name: "República Brewing Draft Room",
    type: "bar",
    lat: 18.4660, lng: -69.9335,
    avg_price: 2,
    tags: ["para_amigos", "chill", "wifi", "afterwork"],
    details: {
      description: "El santuario de la cerveza artesanal local. Usuarios destacan las IPA frescas y alitas con picante de la casa.",
      instagram: "@republicabrewing",
      schedule: "Mar–Dom 5:00 PM – 12:00 AM",
      phone: "809-563-8822",
      address: "C/ Manuel de Jesús Troncoso 12, Piantini, Santo Domingo"
    }
  },
  {
    name: "Blue Bar JW Marriott",
    type: "bar",
    lat: 18.4682, lng: -69.9392,
    avg_price: 4,
    tags: ["vistas_espectaculares", "elegante", "exclusivo", "cocteleria_autor", "valet_parking", "ambiente_sofisticado"],
    details: {
      description: "Icono de lujo con piso de cristal transparente sobre la avenida. Cócteles moleculares y licores de reserva.",
      instagram: "@jwmarriottsd",
      schedule: "Lun–Dom 4:00 PM – 1:00 AM",
      phone: "809-807-0000",
      address: "JW Marriott, Nivel 5, BlueMall, Santo Domingo"
    }
  },
  {
    name: "Guayabitos Bar & Terrace",
    type: "bar",
    lat: 18.4835, lng: -69.9426,
    avg_price: 2,
    tags: ["terraza", "chill", "para_amigos", "cocteleria"],
    details: {
      description: "Muy acogedor para conversar al aire libre sin el ruido abrumador de una discoteca.",
      instagram: "@guayabitosbar",
      schedule: "Mié–Dom 5:00 PM – 1:00 AM",
      phone: "809-555-0122",
      address: "Av. Sarasota, Bella Vista, Santo Domingo"
    }
  },
  {
    name: "Parada 77 Bar",
    type: "bar",
    lat: 18.4730, lng: -69.8850,
    avg_price: 2,
    tags: ["para_amigos", "musica_en_vivo", "ambiente_festivo"],
    details: {
      description: "Popular lugar bohemio con buena vibra, son tradicional y cerveza vestida de novia.",
      instagram: "@parada77bar",
      schedule: "Mar–Dom 6:00 PM – 2:00 AM",
      phone: "809-688-7777",
      address: "C/ Isabel La Católica 255, Zona Colonial, Santo Domingo"
    }
  },

  // ── CAFÉS DE ESPECIALIDAD & BISTRO ─────────────────────────────────────────
  {
    name: "Storia Caffè",
    type: "cafe",
    lat: 18.4680, lng: -69.9325,
    avg_price: 2,
    tags: ["para_trabajar", "wifi", "brunch_top", "desayuno", "ambiente_acogedor"],
    details: {
      description: "Ampliamente recomendado por nómadas digitales por su internet rápido, enchufes y flat white impecable.",
      instagram: "@storiacaffe",
      schedule: "Lun–Vie 7:00 AM – 9:00 PM, Sáb–Dom 8:00 AM – 9:00 PM",
      phone: "809-555-0022",
      address: "C/ Jacinto Mañón, Piantini, Santo Domingo"
    }
  },
  {
    name: "CafeDom Specialty Coffee",
    type: "cafe",
    lat: 18.4727, lng: -69.9334,
    avg_price: 2,
    tags: ["para_trabajar", "wifi", "desayuno", "ambiente_acogedor"],
    details: {
      description: "Los amantes del café destacan los métodos de extracción V60 y Chemex con granos dominicanos seleccionados.",
      instagram: "@cafedom.rd",
      schedule: "Lun–Sáb 7:00 AM – 8:00 PM",
      phone: "809-555-0133",
      address: "C/ José Contreras, Piantini, Santo Domingo"
    }
  },
  {
    name: "Brío Café & Brunch",
    type: "cafe",
    lat: 18.4671, lng: -69.9282,
    avg_price: 2,
    tags: ["brunch_top", "desayuno", "wifi", "para_trabajar", "ambiente_acogedor"],
    details: {
      description: "Reseñas elogian sus huevos benedictinos, bowl de acaí y jugos prensados en frío.",
      instagram: "@briocafe.rd",
      schedule: "Lun–Dom 8:00 AM – 6:00 PM",
      phone: "809-555-0144",
      address: "Av. Winston Churchill, Piantini, Santo Domingo"
    }
  },
  {
    name: "La Cafetera Colonial",
    type: "cafe",
    lat: 18.4730, lng: -69.8872,
    avg_price: 2,
    tags: ["para_citas", "chill", "terraza", "desayuno"],
    details: {
      description: "Punto histórico para tomar café con leche y emparedados observando el ir y venir de El Conde.",
      instagram: "@cafeteracolonial",
      schedule: "Lun–Dom 8:00 AM – 9:00 PM",
      phone: "809-555-0166",
      address: "C/ El Conde 103, Zona Colonial, Santo Domingo"
    }
  },
  {
    name: "Bohío Café Speciality & Vegan",
    type: "cafe",
    lat: 18.4679, lng: -69.9354,
    avg_price: 2,
    tags: ["vegano", "para_trabajar", "wifi", "desayuno", "chill"],
    details: {
      description: "Muy valorado por sus postres sin gluten, matcha latte y ambiente libre de ruidos para enfocarse.",
      instagram: "@bohiocafe",
      schedule: "Lun–Sáb 8:00 AM – 7:00 PM",
      phone: "809-555-0177",
      address: "C/ Presidente González, Naco, Santo Domingo"
    }
  },
  {
    name: "Bondelic Pastelería & Café",
    type: "cafe",
    lat: 18.4740, lng: -69.9310,
    avg_price: 2,
    tags: ["desayuno", "brunch_top", "familiar", "ambiente_acogedor"],
    details: {
      description: "Favorito familiar para tartas de cumpleaños, bizcocho de masa panetón y café con crema.",
      instagram: "@bondelic",
      schedule: "Lun–Dom 8:00 AM – 8:00 PM",
      phone: "809-567-5555",
      address: "C/ Paseo de los Locutores 25, Serrallés, Santo Domingo"
    }
  },
  {
    name: "Mamey Librería & Café",
    type: "cafe",
    lat: 18.4735, lng: -69.8840,
    avg_price: 2,
    tags: ["chill", "para_citas", "terraza", "para_trabajar"],
    details: {
      description: "Un oasis de tranquilidad. Reseñas mencionan sus tés orgánicos, limonada con menta y exposiciones de arte.",
      instagram: "@mamey.rd",
      schedule: "Mar–Dom 10:00 AM – 8:00 PM",
      phone: "809-682-1200",
      address: "C/ Las Mercedes 315, Zona Colonial, Santo Domingo"
    }
  }
];

// ── Ejecución ──────────────────────────────────────────────────────────────
async function run() {
  console.log("🧹 Limpiando y reseteando tablas...");
  await pool.query("TRUNCATE places, tags, place_tags, place_details, place_images RESTART IDENTITY CASCADE");

  console.log("🏷️  Registrando nuevo catálogo ampliado de tags de opiniones...");
  const tagMap = {};
  for (const tagName of TAGS) {
    const res = await pool.query(
      "INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id",
      [tagName]
    );
    tagMap[tagName] = res.rows[0].id;
  }

  console.log(`✨ Poblando ${PLACES.length} lugares con tags enriquecidos según opiniones...`);

  for (const item of PLACES) {
    const pRes = await pool.query(
      `INSERT INTO places (name, type, lat, lng, avg_price)
       VALUES ($1, $2::place_type, $3, $4, $5)
       RETURNING id`,
      [item.name, item.type, item.lat, item.lng, item.avg_price]
    );
    const placeId = pRes.rows[0].id;

    if (item.tags && item.tags.length) {
      for (const tName of item.tags) {
        const tagId = tagMap[tName];
        if (tagId) {
          await pool.query(
            "INSERT INTO place_tags (place_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [placeId, tagId]
          );
        }
      }
    }

    if (item.details) {
      const d = item.details;
      await pool.query(
        `INSERT INTO place_details (place_id, description, instagram, website, schedule, phone, address)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [placeId, d.description, d.instagram, d.website || null, d.schedule, d.phone, d.address]
      );
    }
  }

  console.log("✅ Carga y ajuste de tags completado exitosamente.");
  await pool.end();
}

run().catch((err) => {
  console.error("❌ Error durante el seed de tags:", err);
  process.exit(1);
});
