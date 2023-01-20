import { UnknownVersionError } from '../../../common/errors'
import { encodeId } from '../../../common/tools'
import { StakingRewardedEvent } from '../../../types/generated/events'
import { EventContext, EventHandlerContext } from '../../types/contexts'
import { ActionData } from '../../types/data'
import {
  HistoryElement,
  Reward,
} from '../../../model'
import { ERA_MS, FIRST_BLOCK_TIMESTAMP } from '../../util/consts'

interface EventData {
  amount: bigint
  account: Uint8Array
}

function getRewardedEventData(ctx: EventContext): EventData | undefined {
  const event = new StakingRewardedEvent(ctx)

  if (event.isV9090) {
    const [account, amount] = event.asV9090

    return {
      account,
      amount,
    }
  }
  // else {
  //   throw new UnknownVersionError(event.constructor.name)
  // }
}

export async function handleRewarded(ctx: EventHandlerContext) {
  const data = getRewardedEventData(ctx)

  if (!data) return

  await saveReward(ctx, {
    id: ctx.event.id,
    extrinsicHash: ctx.event.extrinsic?.hash,
    extrinsicIdx: ctx.event.extrinsic?.id,
    timestamp: ctx.block.timestamp,
    blockNumber: ctx.block.height,
    amount: data.amount,
    validator: ctx.block.validator,
    accountId: encodeId(data.account),
  })
}

export interface RewardData extends ActionData {
  amount: bigint
  validator?: string
  accountId: string
}

export async function saveReward(ctx: EventHandlerContext, data: RewardData) {
  const { accountId, amount, id, timestamp, extrinsicHash, blockNumber, extrinsicIdx, validator } = data;
  const era = Math.ceil((timestamp - FIRST_BLOCK_TIMESTAMP) / ERA_MS);

  const reward = new Reward({
    amount: amount.toString(),
    isReward: true,
    era,
    eventIdx: id,
    stash: accountId,
    validator
  })

  const historyElement = new HistoryElement({
    id,
    address: accountId,
    timestamp: BigInt(timestamp),
    blockNumber,
    extrinsicIdx,
    extrinsicHash,
    transfer: null,
    extrinsic: null,
    reward,
  })

  await ctx.store.insert(historyElement)
}
