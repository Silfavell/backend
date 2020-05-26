// eslint-disable-next-line no-unused-vars
import { HttpStatusCode } from './HttpStatusCode'

class ServerError extends Error {
	public readonly name: string

	public readonly httpCode: HttpStatusCode

	// public readonly errorCode: number

	public readonly isOperational: boolean

	constructor(name: string, httpCode: HttpStatusCode, description: string, isOperational: boolean) {
		super(description)

		Object.setPrototypeOf(this, new.target.prototype) // restore prototype chain

		this.name = name
		this.httpCode = httpCode
		// this.errorCode = 0 // TODO
		this.isOperational = isOperational

		Error.captureStackTrace(this)
	}
}

export default ServerError