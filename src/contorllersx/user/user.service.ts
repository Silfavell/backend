import ActivationCodes from '../../enums/activation-code-enum'
import { Product, User, ActivationCode, UserDocument } from '../../models'

export const changePassword = (user: UserDocument, newPassword: string) => {
	// eslint-disable-next-line no-param-reassign
	user.password = newPassword
	return user.save().then(() => (
		ActivationCode.deleteOne({
			userPhoneNumber: user.phoneNumber,
			activationCodeType: ActivationCodes.RESET_PASSWORD
		})
	))
}

export const updateUser = (userId: string, userContext: any) => (
	User.findByIdAndUpdate(userId, userContext, { new: true })
)

export const saveAddressToDatabase = (userId: string, address: any) => (
	User.findByIdAndUpdate(userId, {
		$push: {
			addresses: address
		}
	}, { new: true })
)

export const deleteAddress = (userId: string, deletedAddressId: string) => (
	User.findByIdAndUpdate(userId, {
		$pull: {
			addresses: {
				_id: deletedAddressId
			}
		}
	}, { new: true })
)

export const saveFavoriteProductToDatabase = (userId: string, { _id }: any) => (
	User.findByIdAndUpdate(userId, {
		$addToSet: {
			favoriteProducts: _id
		}
	}, {
		new: true,
		fields: { favoriteProducts: 1 }
	})
)

export const removeFavoriteProductFromDatabase = (userId: string, _id: string) => (
	User.findByIdAndUpdate(userId, {
		$pull: {
			favoriteProducts: _id
		}
	}, {
		new: true,
		fields: { favoriteProducts: 1 }
	})
)

export const updatePhoneNumber = (oldPhoneNumber: string, newPhoneNumber: string) => (
	User.findOneAndUpdate({ phoneNumber: oldPhoneNumber }, { phoneNumber: newPhoneNumber }, { new: true })
)

export const getFavoriteProductsFromDatabase = (userId: string) => (
	User.aggregate([
		{
			$match: {
				_id: userId
			}
		},
		{
			$project: {
				favoriteProducts: 1
			}
		},
		{
			$unwind: '$favoriteProducts'
		},
		{
			$project: {
				favoriteProducts: {
					$toObjectId: '$favoriteProducts'
				}
			}
		},
		{
			$lookup: {
				from: Product.collection.name,
				localField: 'favoriteProducts',
				foreignField: '_id',
				as: 'favoriteProducts'
			}
		},
		{
			$unwind: '$favoriteProducts'
		},
		{
			$group: {
				_id: '$_id',
				favoriteProducts: {
					$push: '$favoriteProducts'
				}
			}
		}
	])
)