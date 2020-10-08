import winston from 'winston'
import app from './app'

app.listen(process.env.PORT || 3000, () => winston.loggers.get('logger').info(`Listening on ${process.env.PORT}`))