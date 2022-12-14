console.log('------WORKER');

const printArgs = (fname) => (...args) => console.log('!!!!!', fname, args);
const fxgen = function(argum){
  return ()=>{
    console.log(argum);
  }
}

const importObj = {
  env: {
    abort: printArgs('abort'),
    db_read: printArgs('db_read'),
    db_write: printArgs('db_write'),
    db_remove: printArgs('db_remove'),
    db_scan: printArgs('db_scan'),
    db_next: printArgs('db_next'),
    addr_validate: printArgs('addr_validate'),
    addr_canonicalize: printArgs('addr_canonicalize'),
    addr_humanize: printArgs('addr_humanize'),
    secp256k1_verify: printArgs('secp256k1_verify'),
    secp256k1_recover_pubkey: printArgs('secp256k1_recover_pubkey'),
    ed25519_verify: printArgs('ed25519_verify'),
    ed25519_batch_verify: printArgs('ed25519_batch_verify'),
    debug: printArgs('debug'),
    query_chain: printArgs('query_chain'),

  },
  ethereum: { 
    useGas: fxgen("ethereum.useGas"),
    getAddress: fxgen("ethereum.getAddress"),
    getExternalBalance: fxgen("ethereum.getExternalBalance"),
    getBlockHash: fxgen("ethereum.getBlockHash"),
    call: fxgen("ethereum.call"),
    callDataCopy: fxgen("ethereum.callDataCopy"),
    getCallDataSize: fxgen("ethereum.getCallDataSize"), 
    getCodeSize: fxgen("ethereum.getCodeSize"),
    callDataLoad: fxgen("ethereum.callDataLoad"),
    callCode: fxgen("ethereum.callCode"),
    callDelegate: fxgen("ethereum.callDelegate"),
    callStatic: fxgen("ethereum.callStatic"),
    storageStore: fxgen("ethereum.storageStore"),
    storageLoad: fxgen("ethereum.storageLoad"),
    getCaller: fxgen("ethereum.getCaller"),
    getCallValue: fxgen("ethereum.getCallValue"),
    codeCopy: fxgen("ethereum.codeCopy"),
    getBlockCoinbase: fxgen("ethereum.getBlockCoinbase"),
    create: fxgen("ethereum.create"),
    getBlockDifficulty: fxgen("ethereum.getBlockDifficulty"),
    externalCodeCopy: fxgen("ethereum.externalCodeCopy"),
    getExternalCodeSize: fxgen("ethereum.getExternalCodeSize"),
    getGasLeft: fxgen("ethereum.getGasLeft"),
    getBlockGasLimit: fxgen("ethereum.getBlockGasLimit"),
    getTxGasPrice: fxgen("ethereum.getTxGasPrice"),
    log: fxgen("ethereum.log"),
    getBlockNumber: fxgen("ethereum.getBlockNumber"),
    getTxOrigin: fxgen("ethereum.getTxOrigin"),
    finish: fxgen("ethereum.finish"),
    revert: fxgen("ethereum.revert"),
    getReturnDataSize: fxgen("ethereum.getReturnDataSize"),
    returnDataCopy: fxgen("ethereum.returnDataCopy"),
    selfDestruct: fxgen("ethereum.selfDestruct"),
    getBlockTimestamp: fxgen("ethereum.getBlockTimestamp")
  }
}

var wout = {};

async function blobToWasm(wfile) {
  const buf = await wfile.arrayBuffer()
  console.log('worker--buf', buf);
  const wasm = new WebAssembly.Module(buf);
  console.log('worker--wasm', wasm);
  const instance = new WebAssembly.Instance(wasm, importObj);
  console.log('worker-', instance);
  return instance.exports;
}

async function instantiateWasm(wfile) {
  wout = await blobToWasm(wfile);
  console.log('wout', wout);

  let hout="";
  for (let item in wout) {
    if (item !="memory") {
      let inps = Array(wout[item].length).fill("<input onchange=\"module.doit('"+item+"')\" class=\""+item+"_\"></input>")
      hout = hout + " <button onclick=\"module.doit('"+item+"')\">"+ item+"</button>("+ inps.join(", ")+ (") = <input class=\""+item+"_o\"></input>")+"<br>";
    }
  }
  return hout;
}

async function execute (act, ins) {
  console.log('--worker execute', wout, act, ins);
  if (typeof wout[act] === 'function') {
    return wout[act](...ins)
  }
  if (typeof wout[act] === 'object') {
    return wout[act][ins[0]];
  }
}

self.addEventListener('message', async function (e) {
  console.log('---worker', e.data)
  let result;

  const {type, method, inputs} = e.data;
  if (type === 'execute') {
    result = await execute(method, inputs);
  }
  if (type === 'instantiate') {
    wfile = inputs[0];
    result = await instantiateWasm(wfile);
  }

  self.postMessage({
    output: result,
    type,
    method,
  });
}, false);

