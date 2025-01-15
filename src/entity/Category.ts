import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Transaction } from './Transaction';

@Entity()
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        nullable: false,
        unique: true,
    })
    category_name! : string;

    @CreateDateColumn({
        nullable: false,
    })
    created_at!: Date;

    @OneToMany(() => Transaction, transaction => transaction.category)
    transactions!: Transaction[];

    @UpdateDateColumn({
        nullable: false,
    })
    updated_at!: Date;
}