import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('POST /admin/product', () => {
	it('without categoryId', (done) => (
		request(app)
			.post('/api/admin/product')
			.set({ Authorization: process.env.adminToken })
			.send({
				subCategoryId: JSON.parse(process.env.testSubCategory)._id,
				purchasable: true,
				brand: 'Test Marka',
				name: 'Test Product',
				price: 9,
				type: JSON.parse(process.env.testType)._id
			})
			.expect(200)
			.end((error, response) => {
				expect(response.body.error).to.be.equal('\"categoryId\" is required')
				done()
			})
	))

	it('without subCategoryId', (done) => (
		request(app)
			.post('/api/admin/product')
			.set({ Authorization: process.env.adminToken })
			.send({
				categoryId: JSON.parse(process.env.testCategory)._id,
				purchasable: true,
				brand: 'Test Marka',
				name: 'Test Product',
				price: 9,
				type: JSON.parse(process.env.testType)._id
			})
			.expect(200)
			.end((error, response) => {
				expect(response.body.error).to.be.equal('\"subCategoryId\" is required')
				done()
			})
	))

	it('without brand', (done) => (
		request(app)
			.post('/api/admin/product')
			.set({ Authorization: process.env.adminToken })
			.send({
				categoryId: JSON.parse(process.env.testCategory)._id,
				subCategoryId: JSON.parse(process.env.testSubCategory)._id,
				purchasable: true,
				name: 'Test Product',
				price: 9,
				type: JSON.parse(process.env.testType)._id
			})
			.expect(200)
			.end((error, response) => {
				expect(response.body.error).to.be.equal('\"brand\" is required')
				done()
			})
	))

	it('without name', (done) => (
		request(app)
			.post('/api/admin/product')
			.set({ Authorization: process.env.adminToken })
			.send({
				categoryId: JSON.parse(process.env.testCategory)._id,
				subCategoryId: JSON.parse(process.env.testSubCategory)._id,
				purchasable: true,
				brand: 'Test Marka',
				price: 9,
				type: JSON.parse(process.env.testType)._id
			})
			.expect(200)
			.end((error, response) => {
				expect(response.body.error).to.be.equal('\"name\" is required')
				done()
			})
	))

	it('without price', (done) => (
		request(app)
			.post('/api/admin/product')
			.set({ Authorization: process.env.adminToken })
			.send({
				categoryId: JSON.parse(process.env.testCategory)._id,
				subCategoryId: JSON.parse(process.env.testSubCategory)._id,
				purchasable: true,
				name: 'Test Product',
				brand: 'Test Marka',
				type: JSON.parse(process.env.testType)._id
			})
			.expect(200)
			.end((error, response) => {
				expect(response.body.error).to.be.equal('\"price\" is required')
				done()
			})
	))

	it('without purchasable', (done) => (
		request(app)
			.post('/api/admin/product')
			.set({ Authorization: process.env.adminToken })
			.send({
				categoryId: JSON.parse(process.env.testCategory)._id,
				subCategoryId: JSON.parse(process.env.testSubCategory)._id,
				brand: 'Test Marka',
				name: 'Test Product',
				price: 9,
				type: JSON.parse(process.env.testType)._id
			})
			.expect(200)
			.end((error, response) => {
				expect(response.body.error).to.be.equal('\"purchasable\" is required')
				done()
			})
	))

	it('with 0 price', (done) => (
		request(app)
			.post('/api/admin/product')
			.set({ Authorization: process.env.adminToken })
			.send({
				categoryId: JSON.parse(process.env.testCategory)._id,
				subCategoryId: JSON.parse(process.env.testSubCategory)._id,
				purchasable: true,
				brand: 'Test Marka',
				name: 'Test Product',
				price: 0,
				type: JSON.parse(process.env.testType)._id
			})
			.expect(200)
			.end((error, response) => {
				expect(response.body.error).to.be.equal('\"price\" must be a positive number')
				done()
			})
	))

	it('correct', (done) => (
		request(app)
			.post('/api/admin/product')
			.set({ Authorization: process.env.adminToken })
			.send({
				categoryId: JSON.parse(process.env.testCategory)._id,
				subCategoryId: JSON.parse(process.env.testSubCategory)._id,
				purchasable: true,
				brand: 'Test Marka',
				name: 'Test Product',
				price: 9,
				type: JSON.parse(process.env.testType)._id
			})
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(response.body.name).to.be.equal('Test Product')
				process.env.testProduct = JSON.stringify(response.body)
				done()
			})
	))
})