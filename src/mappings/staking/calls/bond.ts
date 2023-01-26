import { UnknownVersionError } from '../../../common/errors'
import { getOriginAccountId } from '../../../common/tools'
import { StakingBondCall } from '../../../types/generated/calls'
import { CallContext, CallHandlerContext } from '../../types/contexts'
import { saveBond } from '../utils'
import { BondType } from '../../types'

interface CallData {
  amount: bigint
  controller: Uint8Array
  payee: PayeeDataCommon | PayeeDataAccount
}

interface PayeeDataCommon {
  destination: 'Staked' | 'Stash' | 'Controller' | 'None'
}

interface PayeeDataAccount {
  destination: 'Account'
  account: Uint8Array
}

function getCallData(ctx: CallContext): CallData {
  const call = new StakingBondCall(ctx)

  if (call.isV1020) {
    const { value, controller, payee } = call.asV1020
    if (controller.__kind !== 'AccountId') throw new Error()
    return {
      amount: value,
      controller: controller.value,
      payee:
        payee.__kind === 'Account'
          ? {
            destination: payee.__kind,
            account: payee.value,
          }
          : {
            destination: payee.__kind,
          },
    }
  } else if (call.isV1050) {
    const { value, controller, payee } = call.asV1050
    return {
      amount: value,
      controller: controller,
      payee:
        payee.__kind === 'Account'
          ? {
            destination: payee.__kind,
            account: payee.value,
          }
          : {
            destination: payee.__kind,
          },
    }
  } else if (call.isV2028) {
    const { value, controller, payee } = call.asV2028
    return {
      amount: value,
      controller: controller.value as Uint8Array,
      payee:
        payee.__kind === 'Account'
          ? {
            destination: payee.__kind,
            account: payee.value,
          }
          : {
            destination: payee.__kind,
          },
    }
  } else if (call.isV9111) {
    const { value, controller, payee } = call.asV9111
    return {
      amount: value,
      controller: controller.value as Uint8Array,
      payee:
        payee.__kind === 'Account'
          ? {
            destination: payee.__kind,
            account: payee.value,
          }
          : {
            destination: payee.__kind,
          },
    }
  } else {
    throw new UnknownVersionError(call.constructor.name)
  }
}

export async function handleBond(ctx: CallHandlerContext) {
  if (!ctx.call.success) return

  const data = getCallData(ctx)
  const accountId = getOriginAccountId(ctx.call.origin)

  if (!accountId) return

  await saveBond(ctx, {
    id: ctx.call.id,
    timestamp: ctx.block.timestamp,
    blockNumber: ctx.block.height,
    extrinsicHash: ctx.extrinsic.hash,
    accountId,
    amount: data.amount,
    type: BondType.Bonded,
  })
}
