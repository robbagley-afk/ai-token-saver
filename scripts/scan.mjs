import {execFileSync} from 'node:child_process';import {readFile} from 'node:fs/promises';
const files=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const secrets=[/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/\bgh[pousr]_[A-Za-z0-9]{30,}\b/,/\bsk-[A-Za-z0-9_-]{24,}\b/,/\bAKIA[A-Z0-9]{16}\b/,/\b(?:token|password|secret)\s*[:=]\s*["'][A-Za-z0-9_+\/-]{24,}["']/i];
const privateRuntime=/localhost|127\.0\.0\.1|tail\d+|lm studio|coding helper|playwright|robbagley@ensign|ecenter24|mem\.ai\/notes|Local-Infra/i;
const failures=[];
for(const file of files){if(file==='package-lock.json'||file.endsWith('.ico'))continue;const s=await readFile(file,'utf8');if(secrets.some(r=>r.test(s)))failures.push(`${file}: secret pattern`);if(file.startsWith('plugins/')&&privateRuntime.test(s))failures.push(`${file}: private runtime reference`);}
if(failures.length){console.error(failures.join('\n'));process.exit(1);}console.log(`PASS: ${files.length} tracked files scanned; no secret patterns or private plugin runtime references.`);
