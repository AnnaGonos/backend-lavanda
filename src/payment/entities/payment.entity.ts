import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Order } from '../../order/entities/order.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  // ✅ Сумма платежа
  @Column({ type: 'int', nullable: false })
  amount: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  yookassaPaymentId?: string;

  @Column({ type: 'boolean', default: false })
  isPaid: boolean;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({
    type: 'enum',
    enum: ['cash', 'yookassa'],
    default: 'cash'
  })
  method: 'cash' | 'yookassa';

  // Связь с заказом
  @OneToOne(() => Order, (order) => order.payment, { onDelete: 'CASCADE' })
  @JoinColumn()
  order: Order;
}
