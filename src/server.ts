import winston from 'winston'
import app from './app'

app.listen(process.env.PORT, () => winston.loggers.get('logger').info(`Listening on ${process.env.PORT}`))