import mongoose from 'mongoose'
import winston from 'winston'

class Mongo {
	/* eslint-disable no-useless-constructor */
	// eslint-disable-next-line no-empty-function
	private constructor() { }

	static connect(url: string) {
		mongoose.connect(url, {
			useNewUrlParser: true,
			useFindAndModify: false,
			useCreateIndex: true,
			useUnifiedTopology: true
		})

		mongoose.connection.on('open', () => {
			winston.loggers.get('logger').info('Database: Connected.')
		})

		mongoose.connection.on('error', (error) => {
			winston.loggers.get('error-logger').error('Database: Error', error)
			process.exit(3)
		})

		mongoose.Promise = global.Promise
	}
}

export default Mongo