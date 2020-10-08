import express, { Application } from 'express'
import morgan from 'morgan'
import winston from 'winston'
import bodyParser from 'body-parser'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import path from 'path'
import 'winston-daily-rotate-file'

export default (app: Application) => {
	app.use('/api', express.static(path.join(__dirname, '../../public')))
	app.use(cors())
	app.use(helmet())
	app.use(compression())
	app.use(bodyParser.json())
	app.use(bodyParser.urlencoded({ extended: true }))

	const options = {
		file: {
			level: 'info',
			filename: './logs/info/%DATE%.log',
			datePattern: 'YYYY-MM-DD',
			zippedArchive: true,
			handleExceptions: true,
			json: true,
			maxSize: '20m',
			maxFiles: '14d',
			colorize: true
		},
		errorFile: {
			level: 'error',
			filename: './logs/error/%DATE%.log',
			datePattern: 'YYYY-MM-DD',
			zippedArchive: true,
			handleExceptions: true,
			json: true,
			maxSize: '20m',
			maxFiles: '14d',
			colorize: true
		},
		console: {
			level: 'debug',
			handleExceptions: true,
			json: false,
			colorize: true
		}
	}

	const loggerOptions = {
		transports: [
			new (winston.transports.DailyRotateFile)(options.file),
			// new winston.transports.Console(options.console)
		],
		exitOnError: false
	}

	const errorLoggerOptions = {
		transports: [
			new (winston.transports.DailyRotateFile)(options.errorFile),
		],
		exitOnError: false
	}

	const Logger = winston.createLogger(loggerOptions)

	winston.loggers.add('logger', loggerOptions)
	winston.loggers.add('error-logger', errorLoggerOptions)

	app.use(
		morgan('combined', {
			stream: {
				write(message: string) {
					Logger.info(message)
				}
			}
		})
	)
}
