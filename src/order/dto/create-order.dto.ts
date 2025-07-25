export class CreateOrderDto {
  deliveryMethod: 'доставка' | 'самовывоз';
  comment?: string;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress?: string;
  deliveryDate: string;
  deliveryPeriod: 'утро' | 'день' | 'вечер';
  paymentMethod: 'cash' | 'yookassa';
  useBonusPoints?: number;
}

