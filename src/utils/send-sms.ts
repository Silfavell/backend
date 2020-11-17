import axios from 'axios'

export const sendSms = (to: string, message: string) => {
	const xml = 'data=<sms><kno>' + process.env.SMS_USER_NO + '</kno><kulad>' + process.env.SMS_USERNAME + '</kulad><sifre>' + process.env.SMS_API_KEY + '</sifre>' +
		'<gonderen>' + process.env.SMS_SENDER_PHONE + '</gonderen>' +
		'<mesaj>' + message + '</mesaj>' +
		'<numaralar>' + to + '</numaralar>' +
		'<tur>' + 'Normal' + '</tur></sms>'

	axios.post(process.env.SMS_URL, xml, { headers: { 'content-type': 'application/x-www-form-urlencoded' } })
}
