import redis from 'redis'
import Promise from 'bluebird'

class Redis {
	private static client: redis.RedisClient

	/* eslint-disable no-useless-constructor */
	// eslint-disable-next-line no-empty-function
	private constructor() { }

	static connect(url: string) {
		this.client = Promise.promisifyAll(redis).createClient({ url })
	}

	static get getInstance() {
		if (!this.client) {
			throw new Error('Redis not connected!')
		}
		return this.client
	}
}

export default Redis