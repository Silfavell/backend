import jwt from 'jsonwebtoken'
import HttpStatusCodes from 'http-status-codes'

import ServerError from '../../errors/ServerError'
import {
    User,
    Manager,
    UserDocument,
    ManagerDocument,
    AdminDocument
} from '../../models'
import ErrorMessages from '../../errors/ErrorMessages'
import ActivationCodes from '../../enums/activation-code-enum'

import {
    comparePasswords,
    isUserNonExists,
    isUserExists,
    isManagerNonExists,
    isManagerExists
} from './auth.validator'
import ActivationCode from '../../models/ActivationCode'

export const checkConvenientOfActivationCodeRequest = (phoneNumber: string, activationCodeType: ActivationCodes): Promise<UserDocument | ManagerDocument | void> => {
    switch (activationCodeType) {
        case ActivationCodes.REGISTER_USER: return isUserNonExists(phoneNumber)

        case ActivationCodes.RESET_PASSWORD: return isUserExists(phoneNumber)

        case ActivationCodes.REGISTER_MANAGER: return isManagerNonExists(phoneNumber)

        case ActivationCodes.RESET_MANAGER_PASSWORD: return isManagerExists(phoneNumber)

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

export const isManagerVerified = async (manager: ManagerDocument) => {
    if (!manager.verified) {
        throw new ServerError(ErrorMessages.MANAGER_IS_NOT_VERIFIED, HttpStatusCodes.UNAUTHORIZED, ErrorMessages.MANAGER_IS_NOT_VERIFIED, true)
    }

    return
}

export const registerUser = async (data: any) => {// TODO type dto
    const user = await new User(data).save()
    await ActivationCode.deleteOne({
        userPhoneNumber: user.phoneNumber,
        activationCodeType: ActivationCodes.REGISTER_USER
    })

    return user
}

export const registerManager = async (data: any) => {
    const manager = await new Manager(data).save()
    await ActivationCode.deleteOne({
        userPhoneNumber: manager.phoneNumber,
        activationCodeType: ActivationCodes.REGISTER_MANAGER
    })

    return manager
}

export const createToken = (payload: UserDocument | ManagerDocument | AdminDocument): Promise<string> => (
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
