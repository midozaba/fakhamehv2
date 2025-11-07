#!/usr/bin/env node

/**
 * Generate a secure random JWT secret
 *
 * Usage: node generate-jwt-secret.js
 */

import crypto from 'crypto';

const secret = crypto.randomBytes(64).toString('hex');

console.log('\n===========================================');
console.log('🔐 Generated JWT Secret');
console.log('===========================================\n');
console.log(secret);
console.log('\n===========================================');
console.log('📝 Instructions:');
console.log('===========================================\n');
console.log('1. Copy the secret above');
console.log('2. Add to your .env file:');
console.log('   JWT_SECRET=' + secret);
console.log('\n⚠️  Keep this secret secure and never commit it to Git!\n');
