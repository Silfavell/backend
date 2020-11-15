import { Router } from 'express'

import {
    verifyComment,
    deleteComment,
    getWaitingComments,
    saveComment,
    likeComment,
    dislikeComment,
    removeLikeComment,
    removeDislikeComment
} from './comment.service'

import {
    saveCommentSchema,
    likeSchema
} from './comment.validator'

import { handleError } from '../../utils/handle-error'

const router = Router()

router.post('/save', async (req, res, next) => {
    try {
        await saveCommentSchema.validateAsync(req.body)
        const comment = await saveComment(req.user, req.body)

        res.json(comment)
    } catch (error) {
        next(handleError(error, req.protocol + '://' + req.get('host') + req.originalUrl))
    }
})

router.put('/like/:_id', async (req, res, next) => {
    try {
        await likeSchema.validateAsync(req.params._id)
        const response = await likeComment(req.user, req.params._id)

        res.json(response)
    } catch (error) {
        next(handleError(error, req.protocol + '://' + req.get('host') + req.originalUrl))
    }
})

router.put('/remove-like/:_id', async (req, res, next) => {
    try {
        await likeSchema.validateAsync(req.params._id)
        const response = await removeLikeComment(req.user, req.params._id)

        res.json(response)
    } catch (error) {
        next(handleError(error, req.protocol + '://' + req.get('host') + req.originalUrl))
    }
})

router.put('/dislike/:_id', async (req, res, next) => {
    try {
        await likeSchema.validateAsync(req.params._id)
        const response = await dislikeComment(req.user, req.params._id)

        res.json(response)
    } catch (error) {
        next(handleError(error, req.protocol + '://' + req.get('host') + req.originalUrl))
    }
})

router.put('/remove-dislike/:_id', async (req, res, next) => {
    try {
        await likeSchema.validateAsync(req.params._id)
        const response = await removeDislikeComment(req.user, req.params._id)

        res.json(response)
    } catch (error) {
        next(handleError(error, req.protocol + '://' + req.get('host') + req.originalUrl))
    }
})

router.get('/waiting-list', async (req, res, next) => {
    try {
        const comments = await getWaitingComments()

        res.json(comments)
    } catch (error) {
        next(handleError(error, req.protocol + '://' + req.get('host') + req.originalUrl))
    }
})

router.put('/verify-comment/:_id', async (req, res, next) => {
    try {
        const comment = await verifyComment(req.params._id)

        res.json(comment)
    } catch (error) {
        next(handleError(error, req.protocol + '://' + req.get('host') + req.originalUrl))
    }
})

router.delete('/delete-comment/:_id', async (req, res, next) => {
    try {
        const comment = await deleteComment(req.params._id)

        res.json(comment)
    } catch (error) {
        next(handleError(error, req.protocol + '://' + req.get('host') + req.originalUrl))
    }
})

export default router