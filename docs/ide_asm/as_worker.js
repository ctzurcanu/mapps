import asc from "assemblyscript/asc";
import Transformer from "./transformer.js"
import JsonTransformer from "json-as/transform"

console.log('as_worker loaded');
self.postMessage({type: 'init', method: 'init', output: 'loaded'});

const files = {
    "wasmx.ts": `
export declare function getCallData(): ArrayBuffer
export declare function storageStore(key: ArrayBuffer, value: ArrayBuffer): void
export declare function storageLoad(key: ArrayBuffer): ArrayBuffer
export declare function storageStoreGlobal(key: ArrayBuffer, value: ArrayBuffer): void
export declare function storageLoadGlobal(key: ArrayBuffer): ArrayBuffer
export declare function log(value: ArrayBuffer): void
export declare function finish(value: ArrayBuffer): void
export declare function revert(message: ArrayBuffer): void
    `,
  };

const jsonAsFiles = [
    "node_modules/json-as/assembly.ts",
    "node_modules/json-as/node_modules/as-string-sink/assembly.ts",
    // "node_modules/json-as/node_modules/as-bignum/assembly.ts",
]

async function loadFiles() {
    for (let url of jsonAsFiles) {
        if (files[url]) continue;
        const response = await fetch(url);
        const text = await response.text();
        files[url] = text;
    }
}

async function compileAS(value) {
    await loadFiles();
    files["index.ts"] = value;
    let response;
    try {
        response = await asc.main([
        "index.ts", "--textFile", "--optimize"
        ], {
        async readFile(name, baseDir) {
            if (Object.prototype.hasOwnProperty.call(files, name)) {
            return files[name];
            }
            try {
            const fileBuf = await fetch(name);
            const response = await fileBuf.text();
            return response;
            } catch(e) {
            console.log(e);
            }
            return null;
        },
        writeFile(name, data, baseDir) {
        },
        listFiles(dirname, baseDir) {
            return [];
        },
        transforms: [JsonTransformer, Transformer],
        });
    } catch(e) {
        return {
            errMessage: e.message,
            abi: [],
            code: '',
        }
    }
    const err = response.stderr.toString() + (response.error ? ('\n\n' + response.error) : '');
    return {
        errMessage: err,
        code: response.stdout.toString(),
        abi: self.WasmxAbi,
    }
}

self.addEventListener('message', async function (e) {
    let result;
    const {type, method, inputs} = e.data;
    if (type === 'compile') {
      result = await compileAS(...inputs);
    }

    self.postMessage({
      output: result,
      type,
      method,
    });
});
