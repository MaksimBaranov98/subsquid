import { CommonHandlerContext } from '../types/contexts'
import { ActionData } from '../types/data'
import {
  StakeChange,
  AccumulatedStake
} from '../../model'
import { EventHandlerContext } from '../types/contexts'
import { BondType } from '../types'

export interface BondData extends ActionData {
  amount: bigint
  accountId: string
  type: BondType
}

export async function saveBond(ctx: CommonHandlerContext, data: BondData) {
  const { accountId, amount, id, timestamp, extrinsicHash, blockNumber, type } = data;
  const accumulatedAmount = await handleAccumulatedStake(ctx, data) ?? 0n;

  const stakeChange = new StakeChange({
    id,
    eventIdx: id,
    address: accountId,
    timestamp: BigInt(timestamp),
    blockNumber,
    extrinsicHash,
    amount,
    type,
    accumulatedAmount,
  })

  await ctx.store.insert(stakeChange)
}

export interface AccumulatedStakeData extends ActionData {
  amount: bigint
  accountId: string
}

export async function handleAccumulatedStake(ctx: EventHandlerContext | CommonHandlerContext, data: AccumulatedStakeData): Promise<bigint | undefined> {
  const { accountId, amount } = data;
  const accumulatedStake =
    await ctx.store.get(AccumulatedStake, accountId)
    ?? new AccumulatedStake({ id: accountId, amount: 0n });

  const newAccumulatedAmount = accumulatedStake.amount + amount;

  accumulatedStake.amount = newAccumulatedAmount;

  await ctx.store.save(accumulatedStake);

  return newAccumulatedAmount;

  // const accumulatedStake = await ctx.store.get(AccumulatedStake, accountId)

  // if (accumulatedStake !== undefined) {
  //   const oldAccumulatedAmount = BigInt(accumulatedStake.amount).valueOf();
  //   const newAccumulatedAmount = oldAccumulatedAmount + amount;

  //   accumulatedStake.amount = newAccumulatedAmount;

  //   await ctx.store.save(accumulatedStake);

  //   return newAccumulatedAmount;
  // }


  // let newAccumulatedStake = new AccumulatedStake({ id: accountId, amount });

  // await ctx.store.save(newAccumulatedStake);

  // return amount;
}
