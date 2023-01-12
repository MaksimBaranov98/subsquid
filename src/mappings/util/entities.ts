import {
    Transfer,
} from '../../model'
import { CommonHandlerContext } from '../types/contexts'

export interface TransferData {
    id: string,
    fromId: string
    toId: string | null
    amount: bigint
    success: boolean
    fee: string
    eventIdx: number
}

export async function saveTransfer(ctx: CommonHandlerContext, data: TransferData) {
    const { fromId, toId, amount, success, fee, eventIdx, id } = data

    const transfer = new Transfer({
        id,
        from: fromId,
        to: toId ?? '',
        success,
        amount: amount.toString(),
        eventIdx,
        fee
    })

    await ctx.store.insert(transfer)
}
