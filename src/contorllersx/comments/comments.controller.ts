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

const router = Router()

router.post('/save', async (req, res) => {
    await saveCommentSchema.validateAsync(req.body)
    const comment = await saveComment(req.user, req.body)

    res.json(comment)
})

router.put('/like/:_id', async (req, res) => {
    await likeSchema.validateAsync(req.params._id)
    const response = await likeComment(req.user, req.params._id)

    res.json(response)
})

router.put('/remove-like/:_id', async (req, res) => {
    await likeSchema.validateAsync(req.params._id)
    const response = await removeLikeComment(req.user, req.params._id)

    res.json(response)
})

router.put('/dislike/:_id', async (req, res) => {
    await likeSchema.validateAsync(req.params._id)
    const response = await dislikeComment(req.user, req.params._id)

    res.json(response)
})

router.put('/remove-dislike/:_id', async (req, res) => {
    await likeSchema.validateAsync(req.params._id)
    const response = await removeDislikeComment(req.user, req.params._id)

    res.json(response)
})

router.get('/waiting-list', async (_, res) => {
    const comments = await getWaitingComments()

    res.json(comments)
})

router.put('/verify-comment/:_id', async (req, res) => {
    const comment = await verifyComment(req.params._id)

    res.json(comment)
})

router.delete('/delete-comment/:_id', async (req, res, next) => {
    const comment = await deleteComment(req.params._id)

    res.json(comment)
})

export default router