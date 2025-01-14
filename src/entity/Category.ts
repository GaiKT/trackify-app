import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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

    @UpdateDateColumn({
        nullable: false,
    })
    updated_at!: Date;
}