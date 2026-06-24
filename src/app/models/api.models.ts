export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface CategoriaApi {
  id: number;
  nome: string;
  descrizione: string | null;
}

export interface MaterialeApi {
  id: number;
  nome: string;
  descrizione: string | null;
}

export interface ImmagineProdottoApi {
  id: number;
  prodotto_id: number;
  url: string;
  alt_text: string | null;
  ordine: number;
  is_principale: boolean;
}

export interface ProdottoVarianteApi {
  id: number;
  valore: string;
  stock: number;
}

export interface ProdottoListItemApi {
  id: number;
  nome: string;
  descrizione: string | null;
  prezzo_listino: string;
  prezzo_vendita: string;
  ha_sconto: boolean;
  percentuale_sconto: string | null;
  pubblicato: boolean;
  in_evidenza: boolean;
  ha_varianti: boolean;
  categoria: CategoriaApi;
  materiale: MaterialeApi | null;
  caratura: string | null;
  peso_grammi: string | null;
  immagine_principale: { url: string; alt_text: string | null } | null;
  created_at: string;
  updated_at: string;
}

export interface ProdottoDettaglioApi extends ProdottoListItemApi {
  sku: string;
  varianti: ProdottoVarianteApi[];
  immagini: ImmagineProdottoApi[];
}

export interface UtenteApi {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  telefono: string | null;
  tipo_utente: string;
  attivo: boolean;
  created_at: string;
}

export interface IndirizzoApi {
  id: number;
  utente_id: number;
  via: string;
  cap: string;
  citta: string;
  provincia: string;
  nazione: string;
  etichetta: string | null;
  is_predefinito: boolean;
  created_at: string;
  updated_at: string;
}

export interface CarrelloItemProdottoApi {
  id: number;
  nome: string;
  sku: string;
  prezzo_vendita: string;
  ha_sconto: boolean;
  immagine_principale: { url: string; alt_text: string | null } | null;
}

export interface CarrelloItemVarianteApi {
  id: number;
  valore: string;
  sku: string;
  stock: number;
}

export interface CarrelloItemApi {
  id: number;
  prodotto: CarrelloItemProdottoApi;
  variante: CarrelloItemVarianteApi | null;
  quantita: number;
  prezzo_snapshot: string;
}

export interface CarrelloApi {
  id: number;
  items: CarrelloItemApi[];
  totale_stimato: string;
}

export interface OrdineRigaApi {
  id: number;
  prodotto_id: number;
  prodotto_variante_id: number | null;
  nome_snapshot: string;
  sku_snapshot: string;
  variante_valore: string | null;
  quantita: number;
  prezzo_unitario: string;
  percentuale_sconto_applicato: string | null;
}

export interface StatoOrdineApi {
  id: number;
  codice: string;
  label_cliente: string;
}

export interface PagamentoOrdineApi {
  id: number;
  metodo: string;
  dt_pagamento: string;
}

export interface IndirizzoOrdineApi {
  via: string;
  cap: string;
  citta: string;
  provincia: string;
  nazione: string;
}

export interface OrdineListItemApi {
  id: number;
  numero_ordine: number;
  created_at: string;
  totale: string;
  stato: StatoOrdineApi;
}

export interface OrdineDettaglioApi extends OrdineListItemApi {
  righe: OrdineRigaApi[];
  indirizzo: IndirizzoOrdineApi;
  pagamento: PagamentoOrdineApi;
}