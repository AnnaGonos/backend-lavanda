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
import { OrderStatus } from './order-status.enum';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 12 })
  orderNumber: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: ['доставка', 'самовывоз'],
    default: 'самовывоз',
  })
  deliveryMethod: 'доставка' | 'самовывоз';

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({ type: 'text', nullable: true })
  recipientName?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  recipientPhone?: string;

  @Column({ type: 'text', nullable: true })
  deliveryAddress?: string;

  @Column({ type: 'date', nullable: false })
  deliveryDate: Date;

  @Column({
    type: 'enum',
    enum: ['утро', 'день', 'вечер'],
    nullable: false,
  })
  deliveryPeriod: 'утро' | 'день' | 'вечер';

  @Column({ type: 'float', nullable: false })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.CREATED,
  })
  status: OrderStatus;

  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @OneToMany(() => OrderItem, (item) => item.order, {
    eager: true,
  })
  items: OrderItem[];

  @OneToOne(() => Payment, (payment) => payment.order, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  payment?: Payment;
}
