import {
	User,
	UserDocument,
	Comment
} from '../../models'


export const getWaitingComments = () => (
	Comment.find({ verified: false })
)

export const verifyComment = (_id: string) => (
	Comment.findByIdAndUpdate(_id, { verified: true }, { new: true })
)

export const deleteComment = (_id: string) => (
	Comment.findByIdAndDelete(_id)
)

export const saveComment = (user: UserDocument, body: {
	ownerAlias?: string
	productId: string
	comment: string
	title: string
	generalRate: number
	qualityRate: number
	priceRate: number
}) => {
	if (body.ownerAlias) {
		return User.findByIdAndUpdate(user._id, { alias: body.ownerAlias }).then(() => new Comment({
			productId: body.productId,
			ownerId: user._id,
			ownerAlias: body.ownerAlias,
			title: body.title,
			comment: body.comment,
			generalRate: body.generalRate,
			qualityRate: body.qualityRate,
			priceRate: body.priceRate
		}).save())
	}
	return new Comment({
		productId: body.productId,
		ownerId: user._id,
		ownerAlias: user.alias,
		title: body.title,
		comment: body.comment,
		generalRate: body.generalRate,
		qualityRate: body.qualityRate,
		priceRate: body.priceRate
	}).save()
}

export const likeComment = (user: UserDocument, commentId: string) => (
	Comment.findByIdAndUpdate(commentId, {
		$addToSet: {
			likes: user._id
		},
		$pull: {
			dislikes: user._id
		}
	}, { new: true })
)

export const removeLikeComment = (user: UserDocument, commentId: string) => (
	Comment.findByIdAndUpdate(commentId, {
		$pull: {
			likes: user._id
		}
	}, { new: true })
)

export const dislikeComment = (user: UserDocument, commentId: string) => (
	Comment.findByIdAndUpdate(commentId, {
		$addToSet: {
			dislikes: user._id
		},
		$pull: {
			likes: user._id
		}
	}, { new: true })
)

export const removeDislikeComment = (user: UserDocument, commentId: string) => (
	Comment.findByIdAndUpdate(commentId, {
		$pull: {
			dislikes: user._id
		}
	}, { new: true })
)