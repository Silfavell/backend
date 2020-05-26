import express from 'express'
import dotenv from 'dotenv'
import path from 'path'

import {
	middlewares, Mongo, Redis, Elasticsearch
} from './startup'
import controller from './controllers'
import errorHandlerMiddleware from './middlewares/error-handler-middleware'

if (process.env.NODE_ENV.trim() === 'dev') {
	dotenv.config({ path: path.join(__dirname, '../.env') })
} else {
	dotenv.config({ path: path.join(__dirname, '../.production.env') })
}

const app = express()

middlewares(app)
Mongo.connect(process.env.DB_HOST)
Elasticsearch.connect(process.env.ES_HOST)
Redis.connect(process.env.REDIS_HOST)

app.use('/', controller)
app.use(errorHandlerMiddleware)

export default app