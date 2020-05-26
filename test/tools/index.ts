// eslint-disable-next-line import/prefer-default-export
export const isTextContainsAllKeys = (text: string, keys: string[]) => keys.every((key) => text.includes(key))