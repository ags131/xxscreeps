import type { Creep } from 'xxscreeps/mods/creep/creep';
import type { RoomPosition } from 'xxscreeps/game/position';
import type { Structure } from 'xxscreeps/mods/structure/structure';
import * as C from 'xxscreeps/game/constants';
import * as RoomObject from 'xxscreeps/game/object';
import { OwnedStructure, checkPlacement, ownedStructureFormat } from 'xxscreeps/mods/structure/structure';
import { SingleStore, singleStoreFormat } from 'xxscreeps/mods/resource/store';
import { compose, declare, struct, variant, withOverlay } from 'xxscreeps/schema';
import { assign } from 'xxscreeps/utility/utility';
import { registerBuildableStructure } from 'xxscreeps/mods/construction';

export const format = declare('Tower', () => compose(shape, StructureTower));
const shape = struct(ownedStructureFormat, {
	...variant('tower'),
	hits: 'int32',
	store: singleStoreFormat(),
});

export class StructureTower extends withOverlay(OwnedStructure, shape) {
	override get hitsMax() { return C.TOWER_HITS }
	override get structureType() { return C.STRUCTURE_TOWER }
	get energy() { return this.store[C.RESOURCE_ENERGY] }
	get energyCapacity() { return this.store.getCapacity(C.RESOURCE_ENERGY) }

	/**
	 * Remotely attack any creep, power creep or structure in the room.
	 * @param target The target creep.
	 */
	attack(_target: Creep) {
		console.error('TODO: attack');
	}

	/**
	 * Remotely heal any creep or power creep in the room.
	 * @param target The target creep.
	 */
	heal(_target: Creep) {
		console.error('TODO: heal');
	}

	/**
	 * Remotely repair any structure in the room.
	 * @param target The target structure.
	 */
	repair(_target: Structure) {
		console.error('TODO: repair');
	}
}

export function create(pos: RoomPosition, owner: string) {
	const tower = assign(RoomObject.create(new StructureTower, pos), {
		hits: C.TOWER_HITS,
		store: SingleStore['#create'](C.RESOURCE_ENERGY, C.TOWER_CAPACITY),
	});
	tower['#user'] = owner;
	return tower;
}

registerBuildableStructure(C.STRUCTURE_TOWER, {
	obstacle: true,
	checkPlacement(room, pos) {
		return checkPlacement(room, pos) === C.OK ?
			C.CONSTRUCTION_COST.tower : null;
	},
	create(site) {
		return create(site.pos, site['#user']);
	},
});
