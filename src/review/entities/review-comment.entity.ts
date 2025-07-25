import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Review } from './review.entity';

@Entity()
export class ReviewComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  text: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'varchar', default: 'Магазин Лаванда' })
  authorName: string;

  @ManyToOne(() => Review, (review) => review.comments)
  review: Review;
}
