import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn, CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from '../../payment/entities/payment.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 12 })
  orderNumber: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  // Способ доставки
  @Column({
    type: 'enum',
    enum: ['доставка', 'самовывоз'],
    default: 'самовывоз',
  })
  deliveryMethod: 'доставка' | 'самовывоз';

  // Комментарий к заказу
  @Column({ type: 'text', nullable: true })
  comment?: string;

  // Имя получателя
  @Column({ type: 'text', nullable: true })
  recipientName?: string;

  // Телефон получателя
  @Column({ type: 'varchar', length: 20, nullable: true })
  recipientPhone?: string;

  // Адрес доставки
  @Column({ type: 'text', nullable: true })
  deliveryAddress?: string;

  // Время доставки - формат даты: YYYY-MM-DD
  @Column({ type: 'date', nullable: false })
  deliveryDate: Date;

  @Column({
    type: 'enum',
    enum: ['утро', 'день', 'вечер'],
    nullable: false,
  })
  deliveryPeriod: 'утро' | 'день' | 'вечер';

  // Сумма заказа
  @Column({ type: 'float', nullable: false })
  totalAmount: number;

  // Статус заказа
  @Column({
    type: 'enum',
    enum: [
      'created',
      'processing',
      'paid',
      'shipped',
      'completed',
      'cancelled',
    ],
    default: 'created',
  })
  status:
    | 'created'
    | 'processing'
    | 'paid'
    | 'shipped'
    | 'completed'
    | 'cancelled';

  // Пользователь
  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @OneToMany(() => OrderItem, (item) => item.order, {
    eager: true,
  })
  items: OrderItem[];

  // Связь с оплатой
  @OneToOne(() => Payment, (payment) => payment.order, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  payment?: Payment;
}
