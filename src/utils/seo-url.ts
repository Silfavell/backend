export const getSeoUrl = (name: string) => {
	if (!name) {
		return name
	}

	return name.toString() // Convert to string
		.normalize('NFD') // Change diacritics
		.replace(/[\u0300-\u036f]/g, '') // Remove illegal characters
		.replace(/\s+/g, '-') // Change whitespace to dashes
		.split('ı')
		.join('i')
		.toLowerCase() // Change to lowercase
		.replace(/&/g, '-and-') // Replace ampersand
		.replace(/[^a-z0-9\-]/g, '') // Remove anything that is not a letter, number or dash
		.replace(/-+/g, '-') // Remove duplicate dashes
		.replace(/^-*/, '') // Remove starting dashes
		.replace(/-*$/, '') // Remove trailing dashes
}