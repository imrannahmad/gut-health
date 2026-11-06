export interface CheckoutFormData {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  orderNotes?: string;
  paymentMethod: "upi" | "card" | "netbanking" | "cod";
}

export interface OrderConfirmation {
  orderId: string;
  date: string;
  customerName: string;
  email: string;
  items: {
    name: string;
    packName: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
}
