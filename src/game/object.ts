import type { GameConstructor } from '.';
import type { InspectOptionsStylized } from 'util';
import type { Room } from './room';
import type { RoomPosition } from './position';
import type { TypeOf } from 'xxscreeps/schema';
import * as Id from 'xxscreeps/engine/schema/id';
import * as BufferObject from 'xxscreeps/schema/buffer-object';
import { format as roomPositionFormat } from './position';
import { compose, declare, enumerated, struct, vector, withOverlay } from 'xxscreeps/schema';
import { enumeratedForPath } from 'xxscreeps/engine/schema';
import { expandGetters } from 'xxscreeps/utility/inspect';
import { assign } from 'xxscreeps/utility/utility';
import { Game, registerGlobal } from '.';

export interface Schema {}

export const format = declare('RoomObject', () => compose(shape, RoomObject));
const shape = struct({
	id: Id.format,
	pos: roomPositionFormat,
});

export abstract class RoomObject extends withOverlay(BufferObject.BufferObject, shape) {
	abstract get ['#lookType'](): string;
	declare room: Room;
	declare ['#nextPosition']?: RoomPosition;
	declare ['#nextPositionTime']?: number;

	get ['#extraUsers'](): string[] { return [] }
	get ['#hasIntent']() { return false }
	get ['#pathCost'](): undefined | number { return undefined }
	get ['#providesVision']() { return false }
	get ['#user'](): string | null { return null }
	set ['#user'](_user: string | null) { throw new Error('Setting #user on unownable object') }
	// eslint-disable-next-line no-useless-return
	@enumerable get my(): boolean | undefined { return }

	['#addToMyGame'](_game: GameConstructor) {}
	['#afterInsert'](room: Room) {
		this.room = room;
	}

	['#afterRemove'](_room: Room) {
		this.room = undefined as never;
	}

	private [Symbol.for('nodejs.util.inspect.custom')](depth: number, options: InspectOptionsStylized) {
		if (BufferObject.check(this)) {
			return expandGetters(this);
		} else {
			return `${options.stylize(`[${this.constructor.name}]`, 'special')} ${options.stylize('{released}', 'null')}`;
		}
	}
}

export function create<Type extends RoomObject>(instance: Type, pos: RoomPosition): Type {
	return assign<Type, RoomObject>(instance, {
		id: Id.generateId(),
		pos,
	});
}

// Export `RoomObject` to runtime globals
registerGlobal(RoomObject);
declare module 'xxscreeps/game/runtime' {
	interface Global {
		RoomObject: typeof RoomObject;
	}
}

export const actionLogFormat = declare('ActionLog', () => vector(struct({
	type: enumerated(...enumeratedForPath<Schema>()('ActionLog.action')),
	x: 'int8',
	y: 'int8',
	time: 'int32',
})));

export type ActionLog = TypeOf<typeof actionLogFormat>;
type WithActionLog = Record<'#actionLog', ActionLog>;

export function saveAction(object: WithActionLog, type: ActionLog[number]['type'], pos: RoomPosition) {
	const actionLog = object['#actionLog'];
	for (const action of actionLog) {
		if (action.type === type) {
			action.time = Game.time;
			action.x = pos.x;
			action.y = pos.y;
			return;
		}
	}
	actionLog.push({ type, x: pos.x, y: pos.y, time: Game.time });
}
