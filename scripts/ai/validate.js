#!/usr/bin/env node
import Ajv from 'ajv';
import fs from 'fs/promises';
const ajv = new Ajv({ allErrors: true });
const schema = JSON.parse(await fs.readFile('ai-control/ai-schema.json', 'utf8'));
const output = JSON.parse(await fs.readFile(process.argv[2] || 'ai-output.json', 'utf8'));
if (!ajv.validate(schema, output)) { console.error('❌ Invalid AI output'); process.exit(1); }
console.log('✅ AI output valid');
