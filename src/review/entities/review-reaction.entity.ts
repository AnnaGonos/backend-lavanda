import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Review } from './review.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class ReviewReaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'boolean', default: true })
  isHelpful: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.helpfulRatings)
  user: User;

  @ManyToOne(() => Review, (review) => review.reactions)
  review: Review;
}
