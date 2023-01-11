import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"

@Entity_()
export class Transfer {
    constructor(props?: Partial<Transfer>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("text", {nullable: false})
    amount!: string

    @Column_("text", {nullable: false})
    to!: string

    @Column_("text", {nullable: false})
    from!: string

    @Column_("text", {nullable: false})
    fee!: string

    @Column_("int4", {nullable: false})
    eventIdx!: number

    @Column_("bool", {nullable: false})
    success!: boolean
}
