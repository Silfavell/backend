import { Client } from '@elastic/elasticsearch'
import winston from 'winston'

const index = 'doc'
const type = 'doc'

class ElasticSearch {
	private static client: Client

	/* eslint-disable no-useless-constructor */
	// eslint-disable-next-line no-empty-function
	private constructor() { }

	private static deleteIndex = () => (
		// eslint-disable-next-line security/detect-non-literal-fs-filename
		ElasticSearch.client.indices.exists({ index }).then((result) => {
			if (result.body) {
				ElasticSearch.client.indices.delete({ index })
			}
		})
	)

	private static createIndex = () => (
		ElasticSearch.client.indices.create({
			index,
			body: {
				number_of_shards: 4,
				number_of_replicas: 3
			}
		})
	)

	private static closeIndex = () => (
		ElasticSearch.client.indices.close({ index })
	)

	private static openIndex = () => (
		// eslint-disable-next-line security/detect-non-literal-fs-filename
		ElasticSearch.client.indices.open({ index })
	)

	private static putSettings = () => (
		ElasticSearch.client.indices.putSettings({
			index,
			// type,
			body: {
				settings: {
					analysis: {
						analyzer: {
							my_analyzer: {
								tokenizer: 'my_tokenizer'
							}
						},
						tokenizer: {
							my_tokenizer: {
								type: 'ngram',
								min_gram: 2,
								max_gram: 3,
								token_chars: [
									'letter',
									'digit'
								]
							}
						}
					}
				}
			}
		})
	)

	private static putMapping = () => (
		ElasticSearch.client.indices.putMapping({
			index,
			type,
			body: {
				doc: {
					properties: {
						// geometry: {
						// 	properties: {
						// 		location: {
						// 			type: 'geo_point'
						// 		}
						// 	}
						// },
						name: {
							type: 'text'
						}
					}
				}
			}
		})
	)

	private static bootstrap = () => (
		ElasticSearch.deleteIndex()
			.then(ElasticSearch.createIndex)
			.then(ElasticSearch.closeIndex)
			.then(ElasticSearch.putSettings)
			.then(ElasticSearch.putMapping)
			.then(ElasticSearch.openIndex)
			.catch((reason) => {
				winston.loggers.get('error-logger').error('ElasticSearch: Error', reason)
				process.exit(1)
			})
	)

	static connect(url: string) {
		this.client = new Client({ node: url })
		ElasticSearch.bootstrap()
	}

	static get getClient() {
		if (!this.client) {
			throw new Error('Elasticsearch not connected!')
		}
		return this.client
	}
}

export default ElasticSearch