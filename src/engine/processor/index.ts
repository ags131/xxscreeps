import type { CounterExtract, Dictionary, Implementation, UnwrapArray } from 'xxscreeps/utility/types';
import type { Room } from 'xxscreeps/game/room';
import type { RoomObject } from 'xxscreeps/game/object';
import type { ObjectProcessorContext } from './room';
import { PreTick, Processors, Tick } from './symbols';
export type { ObjectReceivers, RoomIntentPayload, SingleIntent } from './room';
export { registerRoomTickProcessor } from './room';

// `RoomObject` type definitions
type IntentProcessorHolder = Dictionary<(receiver: any, context: ObjectProcessorContext, ...data: any) => void>;
type IntentReceiverInstance = {
	[Processors]?: IntentProcessorHolder;
};
type TickProcessor<Type = any> = (receiver: Type, context: ObjectProcessorContext) => void;
declare module 'xxscreeps/game/room/room' {
	interface Room {
		[Processors]?: IntentProcessorHolder;
	}
}
declare module 'xxscreeps/game/object' {
	interface RoomObject {
		[PreTick]?: TickProcessor;
		[Processors]?: IntentProcessorHolder;
		[Tick]?: TickProcessor;
	}
}

// `undefined` is not allowed in intent processors because it JSON serializes to `null`
type AllowedTypes = string | number | boolean | null | AllowedTypes[];
type NullToUndefined<Type> = Type extends null ? undefined | null : Type;
type RemapNull<Type> = Type extends any[] ? {
	[Key in keyof Type]: RemapNull<Type[Key]>;
} : NullToUndefined<Type>;

// Register RoomObject intent processor
export function registerIntentProcessor<Type extends IntentReceiverInstance, Intent extends string, Data extends AllowedTypes[]>(
	receiver: Implementation<Type>,
	intent: Intent,
	process: (receiver: Type, context: ObjectProcessorContext, ...data: Data) => void,
): void | { type: Type; intent: Intent; data: RemapNull<Data> } {
	const processors = receiver.prototype[Processors] = receiver.prototype[Processors] ?? {};
	processors[intent] = process;
}
export interface Intent {}

// Types for intent processors
type Intents = Exclude<UnwrapArray<Intent[keyof Intent]>, void>;
export type IntentReceivers = Room | Intents['type'];
export type IntentsForReceiver<Type extends IntentReceivers> = Type extends any ?
	CounterExtract<Intents, { type: Type; intent: any; data: any }>['intent'] : never;
export type IntentParameters<Type extends IntentReceivers, Intent extends string> =
	CounterExtract<Intents, { type: Type; intent: Intent; data: any }>['data'];

type IntentsForHelper<Type extends IntentReceivers> =
	CounterExtract<Intents, { type: Type; intent: any; data: any }>;

export type IntentListFor<Type extends IntentReceivers> = {
	[Key in IntentsForHelper<Type>['intent']]?: IntentParameters<Type, Key>[];
};

// Register per-tick per-object processor
export function registerObjectPreTickProcessor<Type extends RoomObject>(
	receiver: Implementation<Type>, fn: TickProcessor<Type>,
) {
	receiver.prototype[PreTick] = fn;
}

export function registerObjectTickProcessor<Type extends RoomObject>(
	receiver: Implementation<Type>, fn: TickProcessor<Type>,
) {
	receiver.prototype[Tick] = fn;
}
