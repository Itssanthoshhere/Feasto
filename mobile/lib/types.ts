export type User = {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: 'customer' | 'seller' | 'rider' | 'admin';
};

export type LocationData = {
  latitude: number;
  longitude: number;
  formattedAddress: string;
};

export type IRestaurant = {
  _id: string;
  name: string;
  image?: string;
  rating: number;
  totalReviews: number;
  isOpen: boolean;
  kitchenLoad?: 'normal' | 'busy' | 'very_busy';
  autoLocation: {
    coordinates: [number, number];
    formattedAddress: string;
  };
  cuisineType?: string[];
};

export type IMenuItem = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isAvailable?: boolean;
  restaurantId: string;
};

export type IPromotion = {
  _id: string;
  code: string;
  discountType: 'percent' | 'flat';
  discountValue: number;
  minOrderValue: number;
};

export type ICart = {
  _id: string;
  itemId: IMenuItem;
  restaurantId: IRestaurant;
  quantity: number;
};

export type IOrderItem = {
  name: string;
  quantity: number;
  price: number;
  image?: string;
};

export type IOrder = {
  _id: string;
  restaurantName: string;
  restaurantId: string;
  items: IOrderItem[];
  totalAmount: number;
  status: import('./orderConstants').OrderStatus;
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: Date;
  riderName?: string;
  riderPhone?: string;
  deliveryAddress?: {
    formattedAddress: string;
  };
};
