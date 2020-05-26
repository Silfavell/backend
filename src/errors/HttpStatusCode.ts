import HttpStatusCodes from 'http-status-codes'

type HttpStatusCodesMap = typeof HttpStatusCodes
export type HttpStatusCode = Extract<HttpStatusCodesMap[keyof HttpStatusCodesMap], number>