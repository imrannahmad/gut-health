import { PackOption } from "./product";

export interface CartItem {
  productId: string;
  productName: string;
  packOption: PackOption;
  quantity: number;
  image: string;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (packOption: PackOption, quantity?: number) => void;
  removeItem: (packOptionId: string) => void;
  updateQuantity: (packOptionId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}
