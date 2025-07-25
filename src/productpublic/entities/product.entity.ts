import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Category, CategoryList } from './category-product.enum';
import { Review } from '../../review/entities/review.entity';
import { Cart } from '../../cart/entities/cart.entity';
import { Favorite } from '../../favorite/entities/favorite.entity';
import { OrderItem } from '../../order/entities/order-item.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'float', nullable: false })
  price: number;

  @Column({ type: 'float', nullable: true })
  discount?: number;

  @Column({ type: 'text', nullable: true })
  composition?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: CategoryList, nullable: false })
  category: Category;

  @Column({ type: 'varchar', nullable: false })
  image: string;

  @Column({ type: 'integer', default: 0, nullable: false })
  stock: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @OneToMany(() => OrderItem, (item) => item.product)
  orderItems: OrderItem[];

  @OneToMany(() => Favorite, (fav) => fav.product)
  favorites: Favorite[];

  @OneToMany(() => Cart, (cart) => cart.product)
  cartItems: Cart[];
}
