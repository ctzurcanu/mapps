// import { toString, isStdlib, getName, getTypeName } from "visitor-as/dist/utils.js";
// import { BaseVisitor } from "visitor-as/dist/index.js";
// import { Transform } from "assemblyscript/dist/transform.js";

import { BaseVisitor } from "visitor-as";
import { toString, getName, getTypeName, isStdlib } from "visitor-as/utils";
import { Transform } from "assemblyscript/transform";
class EventInput {
}
class EventData {
    constructor() {
        this.name = "";
        this.inputs = [];
        this.type = "event";
    }
}
class FunctionArg {
    constructor() {
        this.name = "";
        this.type = "";
        this.internalType = "";
    }
    clone() {
        var _c;
        const newarg = new FunctionArg();
        newarg.name = this.name;
        newarg.type = this.type;
        newarg.internalType = this.internalType;
        newarg.components = (_c = this.components) === null || _c === void 0 ? void 0 : _c.map(v => v.clone());
        return newarg;
    }
}
class FunctionData {
    constructor() {
        this.name = "";
        this.inputs = [];
        this.outputs = [];
        this.type = "function";
        this.stateMutability = ""; // nonpayable payable view pure
    }
}
class AsWasmxTransform extends BaseVisitor {
    constructor() {
        super(...arguments);
        this.functions = [];
        this.events = [];
        this.unknownTypes = {};
    }
    visitFunctionDeclaration(node) {
        var _c, _d;
        if (!((_c = node.decorators) === null || _c === void 0 ? void 0 : _c.length))
            return;
        let foundDecorator;
        let isQuery = true;
        for (const decorator of node.decorators) {
            // @ts-ignore
            const decoratorName = decorator.name.text.toLowerCase();
            // @ts-ignore
            if (decoratorName == "wasmx_schema_query") {
                foundDecorator = decorator;
            }
            if (decoratorName == "wasmx_schema_execute") {
                foundDecorator = decorator;
                isQuery = false;
            }
        }
        if (!foundDecorator)
            return;
        const fn = new FunctionData();
        fn.name = getName(node);
        if (foundDecorator.args && foundDecorator.args.length > 0) {
            // @ts-ignore
            fn.stateMutability = foundDecorator.args[0].value;
        }
        else if (!isQuery) {
            fn.stateMutability = 'nonpayable';
        }
        else {
            fn.stateMutability = 'view';
        }
        this.currentFunction = fn;
        node.signature.parameters.forEach((v) => {
            var _c;
            const paramName = getName(v);
            // @ts-ignore
            const paramType = getTypeName(v.type.name);
            const input = new FunctionArg();
            input.name = paramName;
            input.type = getAbiType(paramName);
            input.internalType = paramType;
            this.currentFunction.inputs.push(input);
            if (!this.unknownTypes[paramType]) {
                this.unknownTypes[paramType] = [];
            }
            (_c = this.unknownTypes[paramType]) === null || _c === void 0 ? void 0 : _c.push(input);
        });
        // @ts-ignore
        // const name = getName(node.signature.returnType);
        const returnType = toString(node.signature.returnType);
        if (returnType !== 'void') {
            const output = new FunctionArg();
            // output.name = getName(node.signature.returnType);
            output.type = getAbiType(returnType);
            output.internalType = returnType;
            this.currentFunction.outputs.push(output);
            if (!this.unknownTypes[returnType]) {
                this.unknownTypes[returnType] = [];
            }
            (_d = this.unknownTypes[returnType]) === null || _d === void 0 ? void 0 : _d.push(output);
        }
        this.functions.push(this.currentFunction);
    }
    visitSource(node) {
        super.visitSource(node);
    }
}
class WasmxTypesTransform extends BaseVisitor {
    constructor() {
        super(...arguments);
        this.items = [];
        this.unknownTypes = {};
        this.knownTypes = {};
        this.sources = [];
    }
    visitTypeDeclaration(node) {
        var _c, _d;
        const name = getName(node);
        if (!this.unknownTypes[name] || ((_c = this.unknownTypes[name]) === null || _c === void 0 ? void 0 : _c.length) == 0)
            return;
        // @ts-ignore
        const ttype = toString(node.type);
        (_d = this.unknownTypes[name]) === null || _d === void 0 ? void 0 : _d.forEach((argRef) => {
            argRef.type = EvmTypeMap[name] ? EvmTypeMap[name] : getAbiType(ttype);
        });
        delete this.unknownTypes[name];
    }
    // visitFieldDeclaration(node: FieldDeclaration): void {
    //   // if (!node.name) return;
    //     const paramName = getName(node);
    //     // @ts-ignore
    //     const paramType = node.type?.name?.identifier?.text;
    //     console.log("---visitFieldDeclaration", paramName, paramType);
    //     // @ts-ignore
    //     // console.log('--visitFieldDeclaration', node.type?.typeArguments);
    // }
    visitClassDeclaration(node) {
        var _c, _d;
        const className = node.name.text;
        if (!this.unknownTypes[className] || ((_c = this.unknownTypes[className]) === null || _c === void 0 ? void 0 : _c.length) == 0)
            return;
        const components = [];
        for (const mem of node.members) {
            if (!mem.name || !mem.name.text)
                continue;
            const name = getName(mem);
            if (name.includes('__JSON', 0))
                continue;
            let ttype = "";
            try {
                // @ts-ignore
                ttype = toString(mem.type);
            }
            catch (e) {
                // @ts-ignore
                ttype = getTypeName(mem.type);
            }
            const component = new FunctionArg();
            component.name = name;
            component.type = ttype;
            component.internalType = ttype;
            components.push(component);
        }
        if (components.length === 0)
            return;
        (_d = this.unknownTypes[className]) === null || _d === void 0 ? void 0 : _d.forEach((argRef) => {
            argRef.type = 'tuple';
            argRef.components = components.map(v => {
                var _c;
                const component = v.clone();
                if (!this.unknownTypes[component.internalType]) {
                    this.unknownTypes[component.internalType] = [];
                }
                (_c = this.unknownTypes[component.internalType]) === null || _c === void 0 ? void 0 : _c.push(component);
                return component;
            });
        });
        delete this.unknownTypes[className];
    }
    visitSource(node) {
        super.visitSource(node);
    }
}
export default class Transformer extends Transform {
    // Trigger the transform after parse.
    afterParse(parser) {
        // Create new transform
        const transformer = new AsWasmxTransform();
        const transformer2 = new WasmxTypesTransform();
        // Sort the sources so that user scripts are visited last
        const sources = parser.sources.filter(source => !isStdlib(source)).sort((_a, _b) => {
            const a = _a.internalPath;
            const b = _b.internalPath;
            if (a[0] === "~" && b[0] !== "~") {
                return -1;
            }
            else if (a[0] !== "~" && b[0] === "~") {
                return 1;
            }
            else {
                return 0;
            }
        });
        // Loop over every source
        for (const source of sources) {
            // Ignore all lib and std. Visit everything else.
            if (!isStdlib(source)) {
                transformer.visit(source);
            }
        }
        transformer2.items = [...transformer.functions, ...transformer.events];
        transformer2.unknownTypes = transformer.unknownTypes;
        let unknowns = Object.keys(transformer2.unknownTypes);
        while (Object.keys(transformer2.unknownTypes).length > 0) {
            for (const source of sources) {
                // Ignore all lib and std. Visit everything else.
                if (!isStdlib(source)) {
                    transformer2.visit(source);
                }
            }
            const currentUnknowns = Object.keys(transformer2.unknownTypes);
            if (stringArrayIsEqual(unknowns, currentUnknowns)) {
                break;
            }
            unknowns = currentUnknowns;
        }
        const abi = JSON.stringify(transformer2.items);
        if (typeof window !== 'undefined') {
            // @ts-ignore
            window.WasmxAbi = JSON.parse(abi);
        }
        if (typeof globalThis !== 'undefined') {
            // @ts-ignore
            globalThis.WasmxAbi = JSON.parse(abi);
        }
    }
}
;
function stringArrayIsEqual(arr1, arr2) {
    if (arr1.length !== arr2.length)
        return false;
    for (let item of arr1) {
        if (!includes(arr2, item))
            return false;
    }
    return true;
}
function includes(arr, item) {
    for (let value of arr) {
        if (value === item)
            return true;
    }
    return false;
}
function getAbiType(ttype) {
    const result = EvmTypeMap[ttype];
    if (result) {
        return result;
    }
    ;
    return ttype;
}
const EvmTypeMap = {
    Address: 'address',
    Uint256: 'uint256',
    Uint128: 'uint128',
    v128: 'uint128',
    i32: 'int32',
    u32: 'uint32',
    i64: 'int64',
    u64: 'uint64',
    isize: 'int64',
    usize: 'uint64',
    f32: 'uint64',
    f64: 'uint128',
    i8: 'int8',
    u8: 'uint8',
    i16: 'int16',
    u16: 'uint16',
    bool: 'bool',
    ArrayBuffer: 'bytes',
    Uint8Array: 'bytes',
    // StaticArray
    // Symbol
    // TypedArray
    // Int8Array
    // NaN
    // Map<string,string>
    // string[], u8[] - Arrays
};
