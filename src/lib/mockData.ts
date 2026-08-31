import type { Category, Technician, ClassifiedListing, Comment, Post } from "../types";

export const categories: Category[] = [
  { id: "ferramentas-eletricas", name: "Ferramentas Elétricas", parentId: null },
  { id: "esmerilhadeira", name: "Esmerilhadeira", parentId: "ferramentas-eletricas" },
  { id: "furadeira", name: "Furadeira / Parafusadeira", parentId: "ferramentas-eletricas" },
  { id: "serra-circular", name: "Serra Circular / Tico-tico", parentId: "ferramentas-eletricas" },
  { id: "lavadora-alta-pressao", name: "Lavadora de Alta Pressão", parentId: "ferramentas-eletricas" },
  { id: "eletrodomesticos", name: "Eletrodomésticos", parentId: null },
  { id: "maquina-lavar", name: "Máquina de Lavar", parentId: "eletrodomesticos" },
  { id: "geladeira", name: "Geladeira / Freezer", parentId: "eletrodomesticos" },
  { id: "microondas", name: "Micro-ondas", parentId: "eletrodomesticos" },
  { id: "ar-condicionado", name: "Ar-condicionado", parentId: "eletrodomesticos" },
];

export const technicians: Technician[] = [
  {
    id: "t1",
    name: "Roberto Aquino",
    bio: "22 anos de bancada. Especialista em motor de indução e escova de carvão para ferramentas Bosch, DeWalt e Makita.",
    avatarUrl: "https://i.pravatar.cc/160?img=12",
    city: "Guarulhos",
    state: "SP",
    lat: -23.4543,
    lng: -46.5337,
    phone: "(11) 98888-2211",
    categoryIds: ["esmerilhadeira", "furadeira", "serra-circular"],
    plan: "premium",
    rating: { average: 4.8, count: 96 },
    postsCount: 34,
  },
  {
    id: "t2",
    name: "Marcia Fenoll",
    bio: "Técnica em refrigeração doméstica. Troca de compressor, gás e placas de geladeira e freezer.",
    avatarUrl: "https://i.pravatar.cc/160?img=47",
    city: "São Paulo",
    state: "SP",
    lat: -23.5505,
    lng: -46.6333,
    phone: "(11) 97777-4432",
    categoryIds: ["geladeira", "ar-condicionado"],
    plan: "premium",
    rating: { average: 4.9, count: 152 },
    postsCount: 61,
  },
  {
    id: "t3",
    name: "Diego Salustiano",
    bio: "Conserto de máquina de lavar todas as marcas. Atendo a domicílio na região.",
    avatarUrl: "https://i.pravatar.cc/160?img=33",
    city: "Guarulhos",
    state: "SP",
    lat: -23.4628,
    lng: -46.5165,
    phone: "(11) 96666-1190",
    categoryIds: ["maquina-lavar"],
    plan: "free",
    rating: { average: 4.5, count: 28 },
    postsCount: 11,
  },
  {
    id: "t4",
    name: "Ana Kimura",
    bio: "Bancada própria para pequenas ferramentas elétricas. Foco em placa eletrônica e troca de rolamento.",
    avatarUrl: "https://i.pravatar.cc/160?img=5",
    city: "São Paulo",
    state: "SP",
    lat: -23.5329,
    lng: -46.6395,
    phone: "(11) 95555-8823",
    categoryIds: ["furadeira", "lavadora-alta-pressao"],
    plan: "free",
    rating: { average: 4.6, count: 19 },
    postsCount: 8,
  },
];

export const posts: Post[] = [
  {
    id: "p1",
    technicianId: "t1",
    categoryId: "esmerilhadeira",
    title: "Troca de escova de carvão — esmerilhadeira Bosch GWS",
    mediaType: "video",
    mediaUrl: "",
    thumbnailUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=480&q=80",
    description: "Passo a passo da troca das escovas de carvão, incluindo teste de faiscamento antes e depois.",
    rating: { average: 4.9, count: 41 },
  },
  {
    id: "p2",
    technicianId: "t1",
    categoryId: "furadeira",
    title: "Diagnóstico de parafusadeira sem torque",
    mediaType: "video",
    mediaUrl: "",
    thumbnailUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=480&q=80",
    description: "Como identificar engrenagem desgastada versus bateria com célula fraca.",
    rating: { average: 4.7, count: 22 },
  },
  {
    id: "p3",
    technicianId: "t2",
    categoryId: "geladeira",
    title: "Troca de compressor — geladeira frost free",
    mediaType: "video",
    mediaUrl: "",
    thumbnailUrl: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=480&q=80",
    description: "Recarga de gás R600a e vácuo do sistema, com medição final de amperagem.",
    rating: { average: 5.0, count: 58 },
  },
];

export const classifieds: ClassifiedListing[] = [
  {
    id: "c1",
    sellerId: "t1",
    sellerName: "Roberto Aquino",
    title: "Motor de esmerilhadeira Bosch GWS 2000W (usado, funcionando)",
    description: "Motor retirado de aparelho com carcaça trincada. Testado, gira redondo, sem ruído de rolamento.",
    price: 180,
    condition: "usado",
    categoryId: "esmerilhadeira",
    city: "Guarulhos",
    state: "SP",
    imageUrl: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=480&q=80",
    rating: { average: 4.7, count: 6 },
  },
  {
    id: "c2",
    sellerId: "t3",
    sellerName: "Diego Salustiano",
    title: "Kit rolamento + retentor para máquina de lavar Brastemp",
    description: "Kit novo, lacrado, compatível com linha 8kg e 11kg.",
    price: 65,
    condition: "novo",
    categoryId: "maquina-lavar",
    city: "Guarulhos",
    state: "SP",
    imageUrl: "https://images.unsplash.com/photo-1washer-placeholder?w=480&q=80",
    rating: { average: 4.9, count: 14 },
  },
];

export const comments: Comment[] = [
  { id: "cm1", authorName: "Felipe R.", text: "Resolveu minha esmerilhadeira em 20 minutos, recomendo.", stars: 5, createdAt: "2026-08-12" },
  { id: "cm2", authorName: "Juliana M.", text: "Atendimento rápido e explicou tudo que fez.", stars: 5, createdAt: "2026-07-30" },
  { id: "cm3", authorName: "Carlos T.", text: "Bom serviço, preço justo.", stars: 4, createdAt: "2026-07-02" },
];

function toRad(v: number) {
  return (v * Math.PI) / 180;
}

/** Distância aproximada em km entre duas coordenadas (fórmula de Haversine). */
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
