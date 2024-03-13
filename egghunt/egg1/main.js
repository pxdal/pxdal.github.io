function isASCII(str) {
	return /^[\x00-\x7F]*$/.test(str);
}

function encodeMessage(message, key){
	if(key.length < 1) return message;
	
	let encoded = "";

	for(let i = 0; i < message.length; i++){
		// get message char code and key char code
		let inCode = message.charCodeAt(i);
		let keyCode = key.charCodeAt(i % key.length);

		// check that both input and key are valid ascii
		if(!isASCII(inCode) || !isASCII(keyCode)){
			encoded += message[i];
			continue;
		}

		// ignore special characters
		if(inCode < 0x20 || inCode > 0x80){
			encoded += message[i];
			continue;
		}
		
		// get last 4 bits
		let nibble = inCode & 0x0F;

		// add key nibble
		nibble += keyCode & 0x0F;

		// fit to 16
		if(nibble >= 16) nibble -= 16;

		// add in left nibble
		nibble |= inCode & 0xF0;

		encoded += String.fromCharCode(nibble);
	}

	return encoded;
}

function decodeMessage(encoded, key){
	if(key.length < 1) return encoded;
	
	let decoded = "";

	for(let i = 0; i < encoded.length; i++){
		// get message char code and key char code
		let inCode = encoded.charCodeAt(i);
		let keyCode = key.charCodeAt(i % key.length);

		// check that both input and key are valid ascii
		if(!isASCII(inCode) || !isASCII(keyCode)){
			decoded += encoded[i];
			continue;
		}

		// ignore special characters
		if(inCode < 0x20 || inCode > 0x80){
			decoded += encoded[i];
			continue;
		}

		// get last 4 bits
		let nibble = inCode & 0x0F;

		// add key nibble
		nibble -= keyCode & 0x0F;

		// fit to 16
		if(nibble < 0) nibble += 16;

		// add in left nibble
		nibble |= inCode & 0xF0;

		decoded += String.fromCharCode(nibble);
	}

	return decoded;
}

// MAIN //

const encodedMessage = encoded;

const decodeInput = document.getElementById("decode-key");
const decodedMessage = document.getElementById("decoded-message");

decodedMessage.textContent = encodedMessage;

decodeInput.addEventListener("input", e => {
	let providedKey = decodeInput.value.slice(0, keyLength);
	
	for(let i = providedKey.length; i < keyLength; i++){
		providedKey += "a";
	}
	
	decodedMessage.textContent = decodeMessage(encodedMessage, providedKey);
});