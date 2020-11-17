import jwt from 'jsonwebtoken'
import HttpStatusCodes from 'http-status-codes'

import ServerError from '../../errors/ServerError'
import {
    User,
    UserDocument,
    AdminDocument
} from '../../models'
import ErrorMessages from '../../errors/ErrorMessages'
import ActivationCodes from '../../enums/activation-code-enum'

import {
    comparePasswords,
    isUserNonExists,
    isUserExists
} from './auth.validator'
import ActivationCode from '../../models/ActivationCode'

export const checkConvenientOfActivationCodeRequest = (phoneNumber: string, activationCodeType: ActivationCodes): Promise<UserDocument | void> => {
    switch (activationCodeType) {
        case ActivationCodes.REGISTER_USER: return isUserNonExists(phoneNumber)

        case ActivationCodes.RESET_PASSWORD: return isUserExists(phoneNumber)

        case ActivationCodes.UPDATE_PHONE_NUMBER: return isUserNonExists(phoneNumber)

        default: throw new ServerError(ErrorMessages.UNKNOWN_TYPE_OF_ACTIVATION_CODE, HttpStatusCodes.BAD_REQUEST, null, false)
    }
}

export const createActivationCode = async (phoneNumber: string, activationCodeType: ActivationCodes) => {
    const activationCode = parseInt(Math.floor(1000 + Math.random() * 9000).toString(), 10)

    await ActivationCode.findOneAndDelete({ userPhoneNumber: phoneNumber, activationCodeType })
    await new ActivationCode({ userPhoneNumber: phoneNumber, activationCodeType, activationCode }).save()

    return activationCode
}

export const login = async (user: any, password: string) => {
    await comparePasswords(user.password, password)

    return user
}

export const registerUser = async (data: any) => {// TODO type dto
    const user = await new User(data).save()
    await ActivationCode.deleteOne({
        userPhoneNumber: user.phoneNumber,
        activationCodeType: ActivationCodes.REGISTER_USER
    })

    return user
}

export const createToken = (payload: UserDocument | AdminDocument): Promise<string> => (
    new Promise((resolve, reject) => {
        jwt.sign({ payload }, process.env.SECRET, (jwtErr: Error, token: string) => {
            if (jwtErr) {
                reject(jwtErr)
            } else {
                resolve(token)
            }
        })
    })
)
