import { bindMapRenderer, bindRenderer } from 'xxscreeps/backend';
import { Game } from 'xxscreeps/game';
import { renderStore } from 'xxscreeps/mods/resource/backend';
import { StructureRampart } from './rampart';
import { StructureTower } from './tower';
import { StructureWall } from './wall';

bindMapRenderer(StructureWall, () => 'w');

bindRenderer(StructureRampart, (rampart, next) => ({
	...next(),
	isPublic: rampart.isPublic,
	nextDecayTime: Game.time + rampart.ticksToDecay,
}));

bindRenderer(StructureTower, (tower, next) => ({
	...next(),
	...renderStore(tower.store),
	actionLog: {},
}));
