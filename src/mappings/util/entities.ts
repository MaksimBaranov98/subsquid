import {
    Account,
    AccountTransfer,
    Transfer,
    TransferDirection,
    TransferLocationAccount,
} from '../../model'
import { CommonHandlerContext } from '../types/contexts'

export async function getOrCreateAccount(ctx: CommonHandlerContext, id: string): Promise<Account> {
    let account = await ctx.store.get(Account, id)

    if (!account) {
        account = new Account({
            id,
        })

        await ctx.store.insert(account)
    }

    return account
}

export interface TransferData {
    fromId: string
    toId: string | null
    amount: bigint
    success: boolean
}

export async function saveTransfer(ctx: CommonHandlerContext, data: TransferData) {
    const { fromId, toId, amount, success } = data

    const from = await getOrCreateAccount(ctx, fromId)
    const to = toId ? await getOrCreateAccount(ctx, toId) : null

    const transfer = new Transfer({
        from: new TransferLocationAccount({
            id: fromId,
        }),
        to: toId
            ? new TransferLocationAccount({
                id: toId,
            })
            : null,
        success,
        amount: amount.toString(),
        eventIdx: 1,
        fee: '*****'
    })

    await ctx.store.insert(transfer)

    await ctx.store.insert(
        new AccountTransfer({
            transfer,
            account: from,
            direction: TransferDirection.From,
        })
    )

    if (to) {
        await ctx.store.insert(
            new AccountTransfer({
                transfer,
                account: to,
                direction: TransferDirection.To,
            })
        )
    }
}
