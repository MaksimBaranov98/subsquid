import { BalancesTransferAllCall } from '../../../types/generated/calls'
import { encodeId, getOriginAccountId, isAdressSS58 } from '../../../common/tools'
import { UnknownVersionError } from '../../../common/errors'
import { CallContext, CallHandlerContext } from '../../types/contexts'
import { saveTransfer } from '../../util/entities'

interface EventData {
    to: Uint8Array
}

function getCallData(ctx: CallContext): EventData {
    const call = new BalancesTransferAllCall(ctx)
    if (call.isV9050) {
        const { dest } = call.asV9050
        return {
            to: dest.value as Uint8Array,
        }
    } else if (call.isV9111) {
        const { dest } = call.asV9111
        return {
            to: dest.value as Uint8Array,
        }
    } else {
        throw new UnknownVersionError(call.constructor.name)
    }
}

export async function handleTransferAll(ctx: CallHandlerContext) {
    const data = getCallData(ctx)

    const accountId = getOriginAccountId(ctx.call.origin)
    if (!accountId) return

    await saveTransfer(ctx, {
        fromId: accountId,
        toId: isAdressSS58(data.to) ? encodeId(data.to) : null,
        amount: 0n,
        success: ctx.call.success,
    })
}
