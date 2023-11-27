import crypto from 'crypto';

const preFix = "VERACODE-HMAC-SHA-256";
const verStr = "vcode_request_version_1";

function hmac256(data:any, key:any, format:any){
	var hash = crypto.createHmac('sha256', key).update(data);
	// no format = Buffer / byte array
	return hash.digest(format);
}

function getByteArray(hex:any) {
	var bytes = [];

	for(var i = 0; i < hex.length-1; i+=2){
	    bytes.push(parseInt(hex.substr(i, 2), 16));
	}

	// signed 8-bit integer array (byte array)
	return Int8Array.from(bytes);
}

export function generateHeader(url:string, method:string, host:string, id:string, key:string) {

	var data = `id=${id}&host=${host}&url=${url}&method=${method}`;
	var timestamp = (new Date().getTime()).toString();
	var nonce = crypto.randomBytes(16).toString("hex");

	// calculate signature
	var hashedNonce = hmac256(getByteArray(nonce), getByteArray(key), null)
	var hashedTimestamp = hmac256(timestamp, hashedNonce, null)
	var hashedVerStr = hmac256(verStr, hashedTimestamp, null);
	var signature = hmac256(data, hashedVerStr, 'hex');

	return `${preFix} id=${id},ts=${timestamp},nonce=${nonce},sig=${signature}`;
}