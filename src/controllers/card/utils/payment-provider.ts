import Iyzipay from 'iyzipay'

class PaymentProvider {
	private constructor() { }

  private static client: any;

  static getClient() {
  	if (!this.client) {
  		this.client = new Iyzipay({
  			apiKey: process.env.PAYMENT_API_KEY,
  			secretKey: process.env.PAYMENT_SECRET_KEY,
  			uri: process.env.PAYMENT_API_URL
  		})
  	}

  	return this.client
  }
}

export default PaymentProvider