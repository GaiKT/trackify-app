import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Account } from './Account';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        nullable: false,
        length: 100,
    })
    username: string;

    @Column({
        nullable: false,
    })
    password: string;

    @Column({
        nullable: false,
    })
    firstname: string;

    @Column({
        nullable: false,
    })
    lastname: string;

    @Column({
        default: 'active',
    })
    status?: string;

    @OneToMany(() => Account, (account) => account.user_id)
    account: Account[];

    @CreateDateColumn({
        nullable: false,
    })
    created_at: Date;

    @UpdateDateColumn({
        nullable: false,
    })
    updated_at: Date;
}