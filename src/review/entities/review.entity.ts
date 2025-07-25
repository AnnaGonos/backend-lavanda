import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Product } from '../../productpublic/entities/product.entity';
import { User } from '../../user/entities/user.entity';
import { ReviewReaction } from './review-reaction.entity';
import { ReviewComment } from './review-comment.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'smallint', nullable: false })
  rating: number; // Оценка от 1 до 5

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'integer', default: 0, nullable: false })
  helpfulCount: number;

  @ManyToOne(() => User, (user) => user.reviews)
  author: User;

  @ManyToOne(() => Product, (product) => product.reviews, { nullable: true })
  product?: Product;

  @OneToMany(() => ReviewReaction, (reaction) => reaction.review)
  reactions: ReviewReaction[];

  @OneToMany(() => ReviewComment, (comment) => comment.review)
  comments: ReviewComment[];
}
