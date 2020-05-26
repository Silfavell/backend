import getCartBeforePostCartTests from './get-cart-before-post-cart.test'
import deleteCartTests from './delete-cart.test'
import postOrderTests from './post-order.test'
import postCartTests from './post-cart.test'
import getCartTests from './get-cart.test'
import postAddressTests from './post-address.test'
import deleteAddressTests from './delete-address.test'
import postPaymentCardTests from './post-payment-card.test'
import getListCardsTests from './get-list-cards.test'
import deleteCardTests from './delete-card.test'

export default () => describe('user', () => {
	getCartBeforePostCartTests()
	postAddressTests()
	postPaymentCardTests()
	deleteCardTests()
	getListCardsTests()
	postOrderTests()
	deleteCartTests()
	postCartTests()
	getCartTests()
	deleteAddressTests()
})