module.exports = {
	globals: {
		'ts-jest': {
			diagnostics: false,
			tsConfig: 'tsconfig.json'
		}
	},
	globalSetup: '<rootDir>/test/globalSetup.ts',
	moduleFileExtensions: [
		'ts',
		'js'
	],
	transform: {
		'^.+\\.(ts|tsx)$': 'ts-jest'
	},
	testMatch: [
		'**/test/**/*.test.(ts|js)'
	],
	testEnvironment: 'node',
	testTimeout: 15 * 1000
}