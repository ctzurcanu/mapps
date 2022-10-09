importScripts('https://binaries.soliditylang.org/bin/soljson-v0.8.4+commit.c7e474f2.js');
import wrapper from 'solc/wrapper';

console.log('------WORKER', wrapper);
// console.log(solcjs);

// const wrapper = require('solc/wrapper');
// const wrapper = require('https://binaries.soliditylang.org/bin/soljson-latest.js');

// import wrapper from 'solc/wrapper';
// console.log('---wrapper', wrapper);

self.addEventListener('message', (e) => {
	const sourceCode = e.data.sourceCode;
	console.log('----worker received sourceCode', sourceCode);

	const compiler = wrapper(self.Module);
    // const compiler = _solidity_compile;
    const result = compiler.compile(JSON.stringify(sourceCode));
    // console.log('result', result);
	self.postMessage({
		output: JSON.parse(result),
	})
}, false)