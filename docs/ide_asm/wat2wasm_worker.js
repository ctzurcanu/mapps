self.importScripts("https://cdn.jsdelivr.net/gh/AssemblyScript/wabt.js@1.0.32/index.js")

let wat2wasm;
const printArgs = (fname) => (...args) => console.log('!!!!!', fname, args);
const fxgen = function(argum){
  return ()=>{
    console.log(argum);
  }
}

const importObject = {
  //  imports: {
  env: {
      abort: fxgen("env.abort"),
      db_read: fxgen("env.abort"),
      db_write: fxgen("env.abort"),
      db_remove: fxgen("env.abort"),
      addr_validate: fxgen("env.abort"),
      addr_canonicalize: fxgen("env.abort"),
      addr_humanize: fxgen("env.abort"),
      secp256k1_verify: fxgen("env.abort"),
      secp256k1_recover_pubkey: fxgen("env.abort"),
      ed25519_verify: fxgen("env.abort"),
      ed25519_batch_verify: fxgen("env.abort"),
      debug: fxgen("env.abort"),
      query_chain: fxgen("env.abort"),
      db_scan: fxgen("env.abort"),
      db_next: fxgen("env.abort"),

      ethereum_useGas: fxgen("ethereum.useGas"),
      ethereum_getAddress: fxgen("ethereum.getAddress"),
      ethereum_getExternalBalance: fxgen("ethereum.getExternalBalance"),
      ethereum_getBlockHash: fxgen("ethereum.getBlockHash"),
      ethereum_call: fxgen("ethereum.call"),
      ethereum_callDataCopy: fxgen("ethereum.callDataCopy"),
      ethereum_getCallDataSize: fxgen("ethereum.getCallDataSize"),
      ethereum_getCodeSize: fxgen("ethereum.getCodeSize"),
      ethereum_callDataLoad: fxgen("ethereum.callDataLoad"),
      ethereum_callCode: fxgen("ethereum.callCode"),
      ethereum_callDelegate: fxgen("ethereum.callDelegate"),
      ethereum_callStatic: fxgen("ethereum.callStatic"),
      ethereum_storageStore: fxgen("ethereum.storageStore"),
      ethereum_storageLoad: fxgen("ethereum.storageLoad"),
      ethereum_getCaller: fxgen("ethereum.getCaller"),
      ethereum_getCallValue: fxgen("ethereum.getCallValue"),
      ethereum_codeCopy: fxgen("ethereum.codeCopy"),
      ethereum_getBlockCoinbase: fxgen("ethereum.getBlockCoinbase"),
      ethereum_create: fxgen("ethereum.create"),
      ethereum_getBlockDifficulty: fxgen("ethereum.getBlockDifficulty"),
      ethereum_externalCodeCopy: fxgen("ethereum.externalCodeCopy"),
      ethereum_getExternalCodeSize: fxgen("ethereum.getExternalCodeSize"),
      ethereum_getGasLeft: fxgen("ethereum.getGasLeft"),
      ethereum_getBlockGasLimit: fxgen("ethereum.getBlockGasLimit"),
      ethereum_getTxGasPrice: fxgen("ethereum.getTxGasPrice"),
      ethereum_log: fxgen("ethereum.log"),
      ethereum_getBlockNumber: fxgen("ethereum.getBlockNumber"),
      ethereum_getTxOrigin: fxgen("ethereum.getTxOrigin"),
      ethereum_finish: fxgen("ethereum.finish"),
      ethereum_revert: fxgen("ethereum.revert"),
      ethereum_getReturnDataSize: fxgen("ethereum.getReturnDataSize"),
      ethereum_returnDataCopy: fxgen("ethereum.returnDataCopy"),
      ethereum_selfDestruct: fxgen("ethereum.selfDestruct"),
      ethereum_getBlockTimestamp: fxgen("ethereum.getBlockTimestamp"),

  },
    // ethereum: {
    //   useGas: fxgen("ethereum.useGas"),
    //   getAddress: fxgen("ethereum.getAddress"),
    //   getExternalBalance: fxgen("ethereum.getExternalBalance"),
    //   getBlockHash: fxgen("ethereum.getBlockHash"),
    //   call: fxgen("ethereum.call"),
    //   callDataCopy: fxgen("ethereum.callDataCopy"),
    //   getCallDataSize: fxgen("ethereum.getCallDataSize"),
    //   callDataLoad: fxgen("ethereum.callDataLoad"),
    //   callCode: fxgen("ethereum.callCode"),
    //   callDelegate: fxgen("ethereum.callDelegate"),
    //   callStatic: fxgen("ethereum.callStatic"),
    //   storageStore: fxgen("ethereum.storageStore"),
    //   storageLoad: fxgen("ethereum.storageLoad"),
    //   getCaller: fxgen("ethereum.getCaller"),
    //   getCallValue: fxgen("ethereum.getCallValue"),
    //   codeCopy: fxgen("ethereum.codeCopy"),
    //   getBlockCoinbase: fxgen("ethereum.getBlockCoinbase"),
    //   create: fxgen("ethereum.create"),
    //   getBlockDifficulty: fxgen("ethereum.getBlockDifficulty"),
    //   externalCodeCopy: fxgen("ethereum.externalCodeCopy"),
    //   getExternalCodeSize: fxgen("ethereum.getExternalCodeSize"),
    //   getGasLeft: fxgen("ethereum.getGasLeft"),
    //   getBlockGasLimit: fxgen("ethereum.getBlockGasLimit"),
    //   getTxGasPrice: fxgen("ethereum.getTxGasPrice"),
    //   log: fxgen("ethereum.log"),
    //   getBlockNumber: fxgen("ethereum.getBlockNumber"),
    //   getTxOrigin: fxgen("ethereum.getTxOrigin"),
    //   finish: fxgen("ethereum.finish"),
    //   revert: fxgen("ethereum.revert"),
    //   getReturnDataSize: fxgen("ethereum.getReturnDataSize"),
    //   returnDataCopy: fxgen("ethereum.returnDataCopy"),
    //   selfDestruct: fxgen("ethereum.selfDestruct"),
    //   getBlockTimestamp: fxgen("ethereum.getBlockTimestamp")
    // }
  //}
  wasmx: {
    getCallData: () => {},
    storageStore: (key, value) => {},
    storageLoad: (key) => {},
    storageStoreGlobal: (key, value) => {},
    storageLoadGlobal: (key) => {},
    log: (value) => {},
    finish: (value) => {},
    revert: (message) => {},
  }
}

WabtModule().then(function(wabt) {
    function compile(fileName, watTxt, features) {
        var outputLog;
        var errMessages = [];
        var binaryBuffer = null;
        var module
        var binaryOutput;

        try {
          module = wabt.parseWat(fileName, watTxt, features);
        } catch (e) {
          console.error(e);
          errMessages.push("wabt.parseWat failed: " + e.toString());
        }

        if (module) {
          try {
            module.resolveNames();
          } catch (e) {
            errMessages.push("wasm resolveNames failed: " + e.toString());
          }

          try {
            module.validate(features);
          } catch (e) {
            errMessages.push("wasm validate failed: " + e.toString());
          }

          try {
            binaryOutput = module.toBinary({log: true, write_debug_names:true});
          } catch (e) {
            errMessages.push("wasm toBinary failed: " + e.toString());
          }

          try {
            module.destroy();
          } catch (e) {
            errMessages.push("wasm destroy failed: " + e.toString());
          }
        }

        if (binaryOutput) {
          outputLog = binaryOutput.log;
          binaryBuffer = binaryOutput.buffer;
        }

        return {
            outputLog,
            errMessage: errMessages.length > 0 ? errMessages.join("; ") : null,
            binaryBuffer,
            module,
        }
    }
    wat2wasm = compile;
});

var wout;
var wasmInstance;
function compileWat2Wasm(watSource) {
    const response = wat2wasm('unnamed.wat', watSource, {multi_memory: true});
    if (response.binaryBuffer) {
        const wasm = new WebAssembly.Module(response.binaryBuffer);
        wasmInstance = new WebAssembly.Instance(wasm, importObject);
        self.wasmInstance = wasmInstance;
        wout = wasmInstance.exports;
    } else {
        wasmInstance = null;
    }
    return {...response, instance: wasmInstance};
  }

async function interfaceFromWasm(wout) {
    let hout="";
    for (let item in wout) {
      if (item !="memory") {
        let inps = Array(wout[item].length).fill("<input onchange=\"module.doit('"+item+"')\" class=\""+item+"_\"></input>")
        hout = hout + " <button onclick=\"module.doit('"+item+"')\">"+ item+"</button>("+ inps.join(", ")+ (") = <input class=\""+item+"_o\"></input>")+"<br>";
      }
    }
    return hout;
}

async function instantiateWasm(wfile) {
  wout = await blobToWasm(wfile);
  return interfaceFromWasm(wout);
}

async function execute (act, ins) {
//   console.log('--worker execute', wout, act, ins);
  if (typeof wout[act] === 'function') {
    return wout[act](...ins)
  }
  if (typeof wout[act] === 'object') {
    return wout[act][ins[0]];
  }
}

self.addEventListener('message', async function (e) {
    // console.log('---WORKER received message', e.data)
    let result;

    const {type, method, inputs} = e.data;
    if (type === 'compile') {
      result = compileWat2Wasm(...inputs);
      result = {
        outputLog: result.outputLog,
        errMessage: result.errMessage,
        binaryBuffer: result.binaryBuffer,
        }
    }
    else if (type === 'execute') {
        result = await execute(method, inputs);
    }
    else if (type === 'instantiate') {
        wfile = inputs[0];
        result = await instantiateWasm(wfile);
    }
    console.log('---WORKER result', result);

    self.postMessage({
      output: result,
      type,
      method,
    });
});
