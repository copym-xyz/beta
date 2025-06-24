#!/usr/bin/env node
/**
 * Sumsub API Signature Generator (ESM Version)
 */

import crypto from 'crypto';
import process from 'process';
import path from 'path';
import { fileURLToPath } from 'url';

// Function: Generate Sumsub API Signature
/**
 * Generates a Sumsub API request signature
 * 
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {string} url - Relative URL path with query parameters
 * @param {string} ts - Unix timestamp in seconds
 * @param {string|Object} body - Request body (empty string for GET requests)
 * @param {string} secretKey - Your Sumsub secret key
 * @returns {string} - The generated signature
 */
export function generateSumsubApiSignature(method, url, ts, body, secretKey) {
  console.log(`Generating Sumsub signature for method=${method}, url=${url}, ts=${ts}, secretKey=${secretKey ? '***' : 'undefined'}`);

  method = (method || '').toUpperCase();
  const bodyStr = typeof body === 'object' ? JSON.stringify(body) : (body || '');
  const signingStr = ts + method + url + bodyStr;

  const signature = crypto.createHmac('sha256', secretKey)
    .update(signingStr)
    .digest('hex');

  console.log(`Generated signature: ${signature.substr(0, 10)}... (truncated)`);
  return signature;
}

// CLI Execution Handler
function runCLI() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: node generateSumsubApiSignature.js METHOD URL [BODY] [SECRET_KEY]');
    console.log('Example: node generateSumsubApiSignature.js POST "/resources/accessTokens?userId=user123" "" "your_secret_key"');
    process.exit(1);
  }

  const method = args[0];
  const url = args[1];
  const body = args.length > 2 ? args[2] : '';
  const secretKey = args.length > 3 ? args[3] : process.env.SUMSUB_SECRET_KEY || 'Kjp1bbs4_rDiyQYl4feXceLqbkn';
  const ts = Math.floor(Date.now() / 1000);

  const signature = generateSumsubApiSignature(method, url, ts, body, secretKey);

  console.log('\nSumsub API Request Signature:');
  console.log('----------------------------');
  console.log(`Timestamp: ${ts}`);
  console.log(`Signature: ${signature}`);
  console.log('\nFor curl:');
  console.log(`curl -H "X-App-Token: YOUR_APP_TOKEN" -H "X-App-Access-Sig: ${signature}" -H "X-App-Access-Ts: ${ts}" -X ${method} "https://api.sumsub.com${url}"`);
  console.log('\nFor Postman:');
  console.log('Headers:');
  console.log('X-App-Access-Sig: ' + signature);
  console.log('X-App-Access-Ts: ' + ts);
  console.log('X-App-Token: YOUR_APP_TOKEN');
}

// Run if executed directly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
if (process.argv[1] === __filename) {
  runCLI();
}
