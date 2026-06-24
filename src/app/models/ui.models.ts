export interface ProductVariant {
  id: number;
  value: string;
  stock: number;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  priceList: number;
  priceSale: number;
  hasDiscount: boolean;
  categoryId: number;
  categoryName: string;
  category: Category;
  materialId: number | null;
  materialName: string | null;
  material: Material | null;
  karat: number | null;
  weightGrams: number | null;
  isFeatured: boolean;
  variants: ProductVariant[];
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export interface Material {
  id: number;
  name: string;
  description: string | null;
}

export interface Address {
  id: number;
  street: string;
  civico: string | null;
  city: string;
  postalCode: string;
  province: string;
  isPrimary: boolean;
}

export interface AddressData {
  street: string;
  civico: string;
  city: string;
  postalCode: string;
  province: string;
}

export type PaymentMethod = 'carta' | 'paypal' | 'contrassegno' | 'bonifico';

export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface CartItem {
  varianteId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string | null;
  stockAvailable: number;
}

export interface RegisterData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  address: AddressData;
}

export interface OrderLine {
  id: number;
  nameSnapshot: string;
  unitPrice: number;
  quantity: number;
  productId: number | null;
}

export interface Order {
  id: number;
  orderNumber: number;
  date: string;
  total: number;
  status: string;
  lines: OrderLine[];
  shippingAddress: Address;
  paymentMethod: string;
}

export function formatStreet(address: Address): string {
  return address.civico ? `${address.street}, ${address.civico}` : address.street;
}

export function addressLabel(address: Address): string {
  return address.isPrimary ? 'Principale' : formatStreet(address);
}

export function discountPercent(priceList: number, priceSale: number): number {
  return Math.round(((priceList - priceSale) / priceList) * 100);
}

export function formatOrderNumber(orderNumber: number, date: string): string {
  const year = new Date(date).getFullYear();
  return `ORD-${year}-${String(orderNumber).padStart(4, '0')}`;
}

export interface CartDisplayInfo {
  productName: string;
  unitPrice: number;
  imageUrl: string | null;
  stockAvailable: number;
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
}