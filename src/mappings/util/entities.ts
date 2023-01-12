import {
    Transfer,
    HistoryElement
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
    timestamp: number
    extrinsicHash: string
    extrinsicIdx: string
    blockNumber: number
}

export async function saveTransfer(ctx: CommonHandlerContext, data: TransferData) {
    const { fromId, toId, amount, success, fee, eventIdx, id, timestamp, extrinsicHash, extrinsicIdx, blockNumber } = data

    const reward = null;
    const extrinsic = null;
    const transfer = new Transfer({
        from: fromId,
        to: toId ?? '',
        success,
        amount: amount.toString(),
        eventIdx,
        fee
    })

    // await ctx.store.insert(transfer)

    const historyElementFrom = new HistoryElement({
        id: `${id}-from`,
        address: fromId,
        blockNumber,
        extrinsicIdx,
        extrinsicHash,
        timestamp: 1,
        extrinsic,
        reward,
        transfer
    })

    await ctx.store.insert(historyElementFrom)

    if (toId) {
        const historyElementTo = new HistoryElement({
            id: `${id}-to`,
            address: toId,
            blockNumber,
            extrinsicIdx,
            extrinsicHash,
            timestamp: 1,
            extrinsic,
            reward,
            transfer
        })

        await ctx.store.insert(historyElementTo)
    }
}
