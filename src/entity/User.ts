import { Entity , PrimaryGeneratedColumn , Column, CreateDateColumn, UpdateDateColumn } from "typeorm";


@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid')
    id : string

    @Column({
        unique : true,
        nullable : false,
        length : 100,
    })
    username : string

    @Column({
        nullable : false
    })
    password : string

    @Column({
        default : 'active'
    })
    status?: string

    @CreateDateColumn({
        nullable : false
    })
    created_at : Date

    @UpdateDateColumn({
        nullable : false
    })
    updated_at : Date

}