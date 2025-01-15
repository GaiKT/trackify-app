import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne , JoinColumn , OneToOne } from 'typeorm';
import { Category } from './Category';
import { Currency } from './Currency';
import { Account } from './Account';

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        nullable: false,
        unique: false
    })
    transaction_name!: string;

    @Column({
        nullable: true,
    })
    description?: string;

    @Column({
        nullable: false,
    })
    amount!: number;

    @Column({
        nullable: false,
    })
    payment_type!: PaymentType;

    @Column({
        nullable: true,
        unique : false
    })
    transaction_slip_url?: string;

    @ManyToOne(() => Account, (account) => account.transactions)
    @JoinColumn()
    account!: Account;

    @ManyToOne(() => Category , (category) => category.transactions)
    @JoinColumn()
    category!: Category
    
    @ManyToOne(() => Currency , (currency) => currency.transactions)
    @JoinColumn()
    currency!: Currency

    @CreateDateColumn({
        nullable: false,
    })
    created_at!: Date;

    @UpdateDateColumn({
        nullable: false,
    })
    updated_at!: Date;
}

export enum PaymentType {
    INCOME = 'income',
    EXPENSE = 'expense'
}