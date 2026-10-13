// Offline reference for the skill's four tiers. Prompt text never leaves this function.
export function classifyTask(prompt){
 if(typeof prompt!=='string'||!prompt.trim())throw Error('A prompt is required');
 if(/medical|legal|irreversible|security.critical|production migration|high.stakes|consequen|payment|financial record|hard bug/i.test(prompt))return 'hard/consequential';
 if(/research|conflicting|tradeoffs?|compare.*sources|audit|investigate|multi.file|debug/i.test(prompt))return 'judgment across sources';
 if(/reformat|extract|classify|dedup|rename|parse|repeat/i.test(prompt))return 'narrow/repeated';
 return 'everyday';
}
