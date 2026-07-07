export const ORDER_STATUSES = [
  'placed',
  'accepted',
  'preparing',
  'ready_for_rider',
  'rider_assigned',
  'picked_up',
  'delivered',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ACTIVE_STATUSES: readonly OrderStatus[] = [
  'placed',
  'accepted',
  'preparing',
  'ready_for_rider',
  'rider_assigned',
  'picked_up',
];

export const STATUS_FLOW: readonly OrderStatus[] = [
  'placed',
  'accepted',
  'preparing',
  'ready_for_rider',
  'rider_assigned',
  'picked_up',
  'delivered',
];

interface StatusMeta {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const STATUS_META: Record<OrderStatus, StatusMeta> = {
  placed: {
    label: 'Order Placed',
    icon: '📋',
    color: '#B45309',
    bgColor: '#FFFBEB',
    borderColor: '#FCD34D',
  },
  accepted: {
    label: 'Accepted',
    icon: '✅',
    color: '#065F46',
    bgColor: '#ECFDF5',
    borderColor: '#6EE7B7',
  },
  preparing: {
    label: 'Preparing',
    icon: '👨‍🍳',
    color: '#1D4ED8',
    bgColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  ready_for_rider: {
    label: 'Ready for Pickup',
    icon: '📦',
    color: '#3730A3',
    bgColor: '#EEF2FF',
    borderColor: '#A5B4FC',
  },
  rider_assigned: {
    label: 'Rider Assigned',
    icon: '🏍️',
    color: '#5B21B6',
    bgColor: '#F5F3FF',
    borderColor: '#C4B5FD',
  },
  picked_up: {
    label: 'On the Way',
    icon: '🚀',
    color: '#6D28D9',
    bgColor: '#F5F3FF',
    borderColor: '#DDD6FE',
  },
  delivered: {
    label: 'Delivered',
    icon: '🎉',
    color: '#15803D',
    bgColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  cancelled: {
    label: 'Cancelled',
    icon: '❌',
    color: '#B91C1C',
    bgColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
};

export const getOrderStatus = (status: OrderStatus) => {
  const meta = STATUS_META[status] || STATUS_META.placed;
  const isCancelled = status === 'cancelled';
  const isActive = ACTIVE_STATUSES.includes(status);
  const stepIndex = STATUS_FLOW.indexOf(status);
  return { meta, isCancelled, isActive, stepIndex };
};
