import {installInstructions,BOOTSTRAP} from '../src/instructions.mjs';
// Optional developer/agent utility; normal users can paste the bootstrap without installing a runtime.
const args=process.argv.slice(2);if(args.length!==2||args[0]!=='--consent'){console.error('Usage: node scripts/install-instructions.mjs --consent /absolute/path/to/AGENTS.md');process.exit(2);}
if(!args[1].startsWith('/'))throw Error('Use an explicit absolute path');
const r=await installInstructions(args[1],BOOTSTRAP);console.log(JSON.stringify(r,null,2));
