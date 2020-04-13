import * as workerThreads from 'worker_threads';
export * from 'worker_threads';
import { Channel } from '~/storage/channel';
import * as Responder from '~/storage/local/responder';

type WorkerOptions = workerThreads.WorkerOptions & {
	runDefault?: true;
};

export class Worker extends workerThreads.Worker {
	constructor(filename: string, options: WorkerOptions = {}) {
		super(`${__dirname}/trampoline.js`, {
			...options,
			argv: [ filename, ...options?.argv ?? [] ],
			workerData: {
				runDefault: options.runDefault,
			},
		});
		Channel.initializeWorker(this);
		Responder.initializeWorker(this);
	}
}

export function waitForWorker(worker: Worker) {
	return new Promise((resolve, reject) => {
		worker.on('exit', code => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`Worker exitted with code: ${code}`));
			}
		});
	});
}
