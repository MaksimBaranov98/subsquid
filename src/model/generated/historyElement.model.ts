import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_, ManyToOne as ManyToOne_} from "typeorm"
import * as marshal from "./marshal"
import {Reward} from "./_reward"
import {Extrinsic} from "./_extrinsic"
import {Transfer} from "./transfer.model"

@Entity_()
export class HistoryElement {
    constructor(props?: Partial<HistoryElement>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("int4", {nullable: false})
    blockNumber!: number

    @Column_("int4", {nullable: true})
    extrinsicIdx!: number | undefined | null

    @Column_("text", {nullable: true})
    extrinsicHash!: string | undefined | null

    @Index_()
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    timestamp!: bigint

    @Index_()
    @Column_("text", {nullable: false})
    address!: string

    @Column_("jsonb", {transformer: {to: obj => obj == null ? undefined : obj.toJSON(), from: obj => obj == null ? undefined : new Reward(undefined, obj)}, nullable: true})
    reward!: Reward | undefined | null

    @Column_("jsonb", {transformer: {to: obj => obj == null ? undefined : obj.toJSON(), from: obj => obj == null ? undefined : new Extrinsic(undefined, obj)}, nullable: true})
    extrinsic!: Extrinsic | undefined | null

    @Index_()
    @ManyToOne_(() => Transfer, {nullable: true})
    transfer!: Transfer | undefined | null
}
