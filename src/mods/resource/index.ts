import type { Manifest } from 'xxscreeps/config/mods';
export const manifest: Manifest = {
	dependencies: [ 'xxscreeps/mods/structure' ],
	provides: [ 'backend', 'constants', 'game' ],
};

export interface Schema {}
