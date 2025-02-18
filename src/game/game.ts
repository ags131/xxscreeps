import type { GameMap, World } from './map';
import type { AnyRoomObject, Room } from './room';
import type { RoomObject } from './object';
import * as Fn from 'xxscreeps/utility/functional';
import { gameInitializers } from './symbols';

/**
 * Underlying game state holder for a tick. Multiple `Game` objects can share this per tick, for
 * instance a processor might have multiple `Game` objects for each user but only one `GameState`
 * per-room per-tick.
 */
export class GameState {
	readonly objects: Map<string, RoomObject>;
	readonly rooms: Record<string, Room>;

	constructor(
		public readonly shard: World,
		public readonly time: number,
		rooms: Room[],
	) {
		this.objects = new Map(Fn.concat(Fn.map(rooms, room =>
			Fn.map(room['#objects'], object => [ object.id, object ]))));
		this.rooms = Fn.fromEntries(Fn.map(rooms, room => [ room.name, room ]));
	}
}

/**
 * `Game` object used by various engine methods.
 */
export class GameBase {
	readonly rooms: Record<string, Room>;
	readonly time: number;
	readonly map: GameMap;
	#state: GameState;

	constructor(state: GameState) {
		this.rooms = state.rooms;
		this.time = state.time;
		this.map = state.shard.map;
		this.#state = state;
	}

	/**
	 * Get an object with the specified unique ID. It may be a game object of any type. Only objects
	 * from the rooms which are visible to you can be accessed.
	 * @param id The unique identifier
	 */
	getObjectById<Type extends RoomObject = AnyRoomObject>(id: string) {
		return this.#state.objects.get(id) as Type | undefined;
	}
}

/**
 * The main global game object containing all the game play information.
 */
export class Game extends GameBase {
	cpu = {
		bucket: 10000,
		limit: 10000,
		tickLimit: 500,
		getUsed: () => 0,
		getHeapStatistics: () => 0,
	};

	gcl = {
		level: 1,
	};

	market = {
		orders: [],
		getAllOrders: () => [],
		incomingTransactions: [],
		outgoingTransactions: [],
	};

	/**
	 * An object describing the world shard where your script is currently being executed in.
	 */
	shard: { name: string; type: string; ptr: boolean };

	constructor(state: GameState) {
		super(state);

		// Shard info
		this.shard = {
			name: state.shard.name,
			type: 'normal',
			ptr: false,
		};

		// Run hooks
		gameInitializers.forEach(fn => fn(this));
		for (const room of Object.values(state.rooms)) {
			for (const object of room['#objects']) {
				if ((object as any).my) {
					object['#addToMyGame'](this);
				}
			}
		}
	}

	/**
	 * Send a custom message at your profile email. This way, you can set up notifications to yourself
	 * on any occasion within the game. You can schedule up to 20 notifications during one game tick.
	 * Not available in the Simulation Room.
	 */
	notify(_message: string, _groupInterval?: number) {
		console.error('TODO: notify');
	}
}
