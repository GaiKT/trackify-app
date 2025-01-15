import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Transaction } from './Transaction';

@Entity()
export class Currency {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        nullable: false,
        unique: true,
    })
    currency_name! : string;

    @Column({
        nullable: false,
        unique: true,
    })
    currency_code! : string;

    @OneToMany(() => Transaction, (transaction) => transaction.currency)
    transactions!: Transaction[];

    @CreateDateColumn({
        nullable: false,
    })
    created_at!: Date;

    @UpdateDateColumn({
        nullable: false,
    })
    updated_at!: Date;
}