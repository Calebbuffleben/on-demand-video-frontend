const CHUNK_PUBLIC_PATH = "server/pages/debug.js";
const runtime = require("../chunks/ssr/[turbopack]_runtime.js");
runtime.loadChunk("server/chunks/ssr/node_modules_c4f1c6._.js");
runtime.loadChunk("server/chunks/ssr/[root of the server]__42c127._.js");
runtime.loadChunk("server/chunks/ssr/[root of the server]__7db6ec._.css");
runtime.loadChunk("server/chunks/ssr/dd92d_modules_@clerk_nextjs_dist_esm_app-router_client_keyless-creator-reader_e1dd72.js");
module.exports = runtime.getOrInstantiateRuntimeModule("[project]/node_modules/next/dist/esm/build/templates/pages.js { INNER_PAGE => \"[project]/src/pages/index.tsx [ssr] (ecmascript)\", INNER_DOCUMENT => \"[project]/src/pages/_document.tsx [ssr] (ecmascript)\", INNER_APP => \"[project]/src/pages/_app.tsx [ssr] (ecmascript)\" } [ssr] (ecmascript)", CHUNK_PUBLIC_PATH).exports;
