const importMap = {
    "imports": {
      "binaryen": "https://cdn.jsdelivr.net/npm/binaryen@110.0.0-nightly.20220924/index.js",
      "long": "https://cdn.jsdelivr.net/npm/long@5.2.0/index.js",
      "assemblyscript": "https://cdn.jsdelivr.net/npm/assemblyscript@0.21.4/dist/assemblyscript.js",
      "assemblyscript/asc": "https://cdn.jsdelivr.net/npm/assemblyscript@0.21.4/dist/asc.js",
      "assemblyscript/transform": "https://cdn.jsdelivr.net/npm/assemblyscript@0.21.4/dist/transform.js",
      "wabt": "https://cdn.jsdelivr.net/gh/AssemblyScript/wabt.js@1.0.32/index.js",
      "codemirror": "https://cdn.skypack.dev/codemirror@6.0.1?min",
      "visitor-as": "https://cdn.jsdelivr.net/npm/visitor-as@0.11.4/+esm",
      "visitor-as/utils": "https://cdn.jsdelivr.net/npm/visitor-as@0.11.4/dist/utils.js/+esm",
      "json-as/transform": "https://cdn.jsdelivr.net/npm/json-as@0.5.36/transform/lib/index.js",

      "visitor-as/dist/utils.js": "https://cdn.jsdelivr.net/npm/visitor-as@0.11.4/dist/utils.js/+esm",
      "visitor-as/dist/index.js": "https://cdn.jsdelivr.net/npm/visitor-as@0.11.4/+esm",
      "assemblyscript/dist/transform.js": "https://cdn.jsdelivr.net/npm/assemblyscript@0.21.4/dist/transform.js",
      "as-string-sink/assembly": "https://cdn.jsdelivr.net/npm/as-string-sink@0.5.3/assembly/+esm",
      "as-bignum": "https://cdn.jsdelivr.net/npm/as-bignum@0.2.31/+esm",
      "as-bignum/assembly": "https://cdn.jsdelivr.net/npm/as-bignum@0.2.31/assembly/index.ts"
    }
}
const shimCodeUrl = "https://ga.jspm.io/npm:es-module-shims@1.7.2/dist/es-module-shims.wasm.js"
const workerCodeUrl = './as_worker.js';

importScripts(shimCodeUrl);
importShim.addImportMap(importMap);
importShim(workerCodeUrl).catch(e => setTimeout(() => { throw e; }));
console.log('as_worker_wrap loaded');
