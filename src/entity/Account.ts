import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class Account {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        nullable: false,
        unique: true,
    })
    name: string;

    @Column({
        nullable: false,
        unique: true,
    })
    accountNumber: string;

    @Column({
        default: 'active',
    })
    status: string;

    @Column({
        default: 0.0,
        nullable: false,
    })
    balance: number;

    @ManyToOne(() => User, (user) => user.account)
    user_id: User;

    @CreateDateColumn({
        nullable: false,
    })
    created_at: Date;

    @UpdateDateColumn({
        nullable: false,
    })
    updated_at: Date;
}