const CHUNK_PUBLIC_PATH = "server/pages/_document.js";
const runtime = require("../chunks/ssr/[turbopack]_runtime.js");
runtime.loadChunk("server/chunks/ssr/node_modules_9b9ef4._.js");
runtime.loadChunk("server/chunks/ssr/[root of the server]__7dacde._.js");
module.exports = runtime.getOrInstantiateRuntimeModule("[project]/src/pages/_document.tsx [ssr] (ecmascript)", CHUNK_PUBLIC_PATH).exports;
