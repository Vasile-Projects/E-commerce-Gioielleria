import {
  CategoriaApi,
  MaterialeApi,
  ProdottoListItemApi,
  ProdottoDettaglioApi,
  ProdottoVarianteApi,
  IndirizzoApi,
  IndirizzoOrdineApi,
  UtenteApi,
  CarrelloItemApi,
  OrdineDettaglioApi,
  OrdineRigaApi,
} from './api.models';
import {
  Category,
  Material,
  Product,
  ProductVariant,
  Address,
  UserProfile,
  CartItem,
  Order,
  OrderLine,
} from './ui.models';

export function mapToProduct(api: ProdottoListItemApi): Product {
  return {
    id: api.id,
    name: api.nome,
    description: api.descrizione,
    priceList: parseFloat(api.prezzo_listino),
    priceSale: parseFloat(api.prezzo_vendita),
    hasDiscount: api.ha_sconto,
    categoryId: api.categoria.id,
    categoryName: api.categoria.nome,
    category: mapToCategory(api.categoria),
    materialId: api.materiale?.id ?? null,
    materialName: api.materiale?.nome ?? null,
    material: api.materiale !== null ? mapToMaterial(api.materiale) : null,
    karat: api.caratura !== null ? parseFloat(api.caratura) : null,
    weightGrams: api.peso_grammi !== null ? parseFloat(api.peso_grammi) : null,
    isFeatured: api.in_evidenza,
    variants: [],
  };
}

export function mapToProductDetail(api: ProdottoDettaglioApi): Product {
  return {
    id: api.id,
    name: api.nome,
    description: api.descrizione,
    priceList: parseFloat(api.prezzo_listino),
    priceSale: parseFloat(api.prezzo_vendita),
    hasDiscount: api.ha_sconto,
    categoryId: api.categoria.id,
    categoryName: api.categoria.nome,
    category: mapToCategory(api.categoria),
    materialId: api.materiale?.id ?? null,
    materialName: api.materiale?.nome ?? null,
    material: api.materiale !== null ? mapToMaterial(api.materiale) : null,
    karat: api.caratura !== null ? parseFloat(api.caratura) : null,
    weightGrams: api.peso_grammi !== null ? parseFloat(api.peso_grammi) : null,
    isFeatured: api.in_evidenza,
    variants: api.varianti.map(mapToVariant),
  };
}

function mapToVariant(api: ProdottoVarianteApi): ProductVariant {
  return {
    id: api.id,
    value: api.valore,
    stock: api.stock,
  };
}

export function mapToCategory(api: CategoriaApi): Category {
  return { id: api.id, name: api.nome, description: api.descrizione };
}

export function mapToMaterial(api: MaterialeApi): Material {
  return { id: api.id, name: api.nome, description: api.descrizione };
}

export function mapToAddress(api: IndirizzoApi): Address {
  return {
    id: api.id,
    street: api.via,
    civico: null,
    city: api.citta,
    postalCode: api.cap,
    province: api.provincia,
    isPrimary: api.is_predefinito,
  };
}

export function mapToUserProfile(api: UtenteApi): UserProfile {
  return {
    id: api.id,
    email: api.email,
    firstName: api.nome,
    lastName: api.cognome,
  };
}

export function mapToCartItem(api: CarrelloItemApi): CartItem {
  return {
    varianteId: api.variante?.id ?? 0,
    productName: api.prodotto.nome,
    unitPrice: parseFloat(api.prezzo_snapshot),
    quantity: api.quantita,
    imageUrl: api.prodotto.immagine_principale?.url ?? null,
    stockAvailable: api.variante?.stock ?? 0,
  };
}

export function mapToOrderLine(api: OrdineRigaApi): OrderLine {
  return {
    id: api.id,
    nameSnapshot: api.nome_snapshot,
    unitPrice: parseFloat(api.prezzo_unitario),
    quantity: api.quantita,
    productId: api.prodotto_id,
  };
}

function mapToOrderAddress(api: IndirizzoOrdineApi): Address {
  return {
    id: 0,
    street: api.via,
    civico: null,
    city: api.citta,
    postalCode: api.cap,
    province: api.provincia,
    isPrimary: false,
  };
}

export function mapToOrder(api: OrdineDettaglioApi): Order {
  return {
    id: api.id,
    orderNumber: api.numero_ordine,
    date: api.created_at,
    total: parseFloat(api.totale),
    status: api.stato.codice,
    lines: api.righe.map(mapToOrderLine),
    shippingAddress: mapToOrderAddress(api.indirizzo),
    paymentMethod: api.pagamento?.metodo ?? '',
  };
}
