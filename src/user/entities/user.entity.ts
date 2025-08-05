import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserRole } from './user-role.enum';
import { Review } from '../../review/entities/review.entity';
import { ReviewReaction } from '../../review/entities/review-reaction.entity';
import { Favorite } from '../../favorite/entities/favorite.entity';
import { Cart } from '../../cart/entities/cart.entity';
import { Order } from '../../order/entities/order.entity';
import { IsString } from 'class-validator';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  firstName: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  lastName: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: false })
  phone: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ default: 0, type: 'float' })
  bonusPoints: number;

  @Column({ default: 1 })
  bonusCardLevel: number;

  @Column({ default: 0, type: 'int' })
  totalOrders: number;

  @OneToMany(() => Review, (review) => review.author)
  reviews: Review[];

  @OneToMany(() => ReviewReaction, (reaction) => reaction.user)
  helpfulRatings: ReviewReaction[];

  @OneToMany(() => Favorite, (fav) => fav.user)
  favorites: Favorite[];

  @OneToMany(() => Cart, (cart) => cart.user)
  cartItems: Cart[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}


// @Column({ type: 'boolean', default: true })
// isPhoneVerified: boolean;
//
// @Column({ type: 'varchar', length: 6, nullable: true })
// verificationCode: string | null;
//
// @Column({ type: 'timestamp', nullable: true })
// verificationCodeSentAt: Date | null;
//
// @Column({ type: 'varchar', length: 6, nullable: true })
// passwordResetCode: string | null;
//
// @Column({ type: 'timestamp', nullable: true })
// passwordResetExpires: Date | null;
