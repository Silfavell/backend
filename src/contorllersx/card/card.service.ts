import Iyzipay from 'iyzipay'
import HttpStatusCodes from 'http-status-codes'

import ErrorMessages from '../../errors/ErrorMessages'
import ServerError from '../../errors/ServerError'

import PaymentProvider from './utils/payment-provider'
import {
    User,
	UserDocument
} from '../../models'

export const updateUser = (userId: string, userContext: any) => (
	User.findByIdAndUpdate(userId, userContext, { new: true })
)

export const addNewCard = (cardUserKey: string, card: any) => (
	new Promise((resolve, reject) => {
		PaymentProvider.getClient().card.create({
			locale: Iyzipay.LOCALE.TR,
			cardUserKey,
			card
		}, (error: any, result: any) => {
			if (error) {
				reject(error)
			} if (result.status === 'failure') {
				reject(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, result.errorMessage, true))
			}
			resolve(result)
		})
	})
)

export const createPaymentUserWithCard = (user: UserDocument, card: any) => (
	new Promise((resolve, reject) => {
		PaymentProvider.getClient().card.create({
			locale: Iyzipay.LOCALE.TR,
			email: user.email,
			gsmNumber: user.phoneNumber,
			card
		}, (error: any, result: any) => {
			if (error) {
				reject(error)
			} if (result.status === 'failure') {
				reject(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, result.errorMessage, true))
			}
			resolve(result)
		})
	})
)

export const addCardToUser = (user: UserDocument, card: any) => {
	if (!user.cardUserKey) {
		return createPaymentUserWithCard(user, card)
			.then((result: any) => updateUser(user._id, { cardUserKey: result.cardUserKey }).then(() => result))
	}
	return addNewCard(user.cardUserKey, card)
}

export const deleteCard = (user: UserDocument, cardToken: string) => (
	new Promise((resolve, reject) => {
		PaymentProvider.getClient().card.delete({
			locale: Iyzipay.LOCALE.TR,
			cardUserKey: user.cardUserKey,
			cardToken
		}, (error: any, result: any) => {
			if (error) {
				reject(error)
			} if (result.status === 'failure') {
				reject(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, result.errorMessage, true))
			}
			resolve(result)
		})
	})
)

export const listCards = (cardUserKey: string) => (
	new Promise((resolve, reject) => {
		if (!cardUserKey) {
			resolve([])
		}
		PaymentProvider.getClient().cardList.retrieve({
			locale: Iyzipay.LOCALE.TR,
			cardUserKey
		}, (error: any, result: any) => {
			if (error) {
				reject(error)
			} if (result.status === 'failure') {
				reject(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, result.errorMessage, true))
			}
			resolve(result)
		})
	})
)
