function formatNumber(number: number) {
	const suffixes = ['', 'K', 'M', 'B', 'T'];
	let suffixIndex = 0;
	while (number >= 1000 && suffixIndex < suffixes.length - 1) {
		number /= 1000;
		suffixIndex++;
	}
	const fixed = number.toFixed(2);
	let end = fixed.length - 1;
	while (fixed[end] === '0' || fixed[end] === '.') {
		end--;
	}
	return fixed.slice(0, end + 1) + suffixes[suffixIndex];
}


export interface Env {
	COUNTER: DurableObjectNamespace;
}

export class Counter {
	storage: DurableObjectStorage;
	constructor(state: DurableObjectState, env: Env) {
		this.storage = state.storage;
	}
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url)
		const paths = url.pathname.split('/').filter(Boolean)
		const [namespace, name, action] = paths
		if (['minute', 'hour', 'day', 'month', 'year'].includes(namespace)) {
			await this.setSpecialNamespaceAlarm(namespace)
		}
		const value: number = await this.storage.get(name) || 0
		switch (action) {
			case 'get':
				return new Response(value.toString(), { headers: { 'content-type': 'text/plain' } })
			case 'humanized':
				return new Response(formatNumber(value), { headers: { 'content-type': 'text/plain' } })
			case 'json':
				return new Response(JSON.stringify({ count: value, humanized: formatNumber(value) }),
					{ headers: { 'content-type': 'application/json' } })
			default:
				await this.storage.put(name, value + 1)
				return new Response((value + 1).toString(), { headers: { 'content-type': 'text/plain' } })
		}
	}

	async setSpecialNamespaceAlarm(namepsace: string) {
		if (await this.storage.getAlarm()) {
			return
		}
		const time = new Date()
		switch (namepsace) {
			case 'year':
				time.setMonth(0)
				if (namepsace === 'year')
					time.setFullYear(time.getFullYear() + 1)
			case 'month':
				time.setDate(1)
				if (namepsace === 'month')
					time.setMonth(time.getMonth() + 1)
			case 'day':
				time.setHours(0)
				if (namepsace === 'day')
					time.setDate(time.getDate() + 1)
			case 'hour':
				time.setMinutes(0)
				if (namepsace === 'hour')
					time.setHours(time.getHours() + 1)
			case 'minute':
				time.setSeconds(0)
				time.setMilliseconds(0)
				if (namepsace === 'minute')
					time.setMinutes(time.getMinutes() + 1)
				break
			default:
				return
		}
		console.log('set alarm： ', time.toLocaleString())
		await this.storage.setAlarm(time.getTime())
	}

	async alarm() {
		this.storage.deleteAll()
	}
}

export default {

	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url)
		const paths = url.pathname.split('/').filter(Boolean)
		if (paths.length < 2) {
			return new Response('Not Found', { status: 404 });
		}
		let id: DurableObjectId = env.COUNTER.idFromName(paths[0]);
		let stub: DurableObjectStub = env.COUNTER.get(id);
		let response = await stub.fetch(request);
		return response;
	},
};
