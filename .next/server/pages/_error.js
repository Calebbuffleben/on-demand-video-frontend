const CHUNK_PUBLIC_PATH = "server/pages/_error.js";
const runtime = require("../chunks/ssr/[turbopack]_runtime.js");
runtime.loadChunk("server/chunks/ssr/node_modules_6af289._.js");
runtime.loadChunk("server/chunks/ssr/[root of the server]__3a1495._.js");
runtime.loadChunk("server/chunks/ssr/src_styles_globals_070f83.css");
runtime.loadChunk("server/chunks/ssr/dd92d_modules_@clerk_nextjs_dist_esm_app-router_client_keyless-creator-reader_cd6521.js");
module.exports = runtime.getOrInstantiateRuntimeModule("[project]/node_modules/next/dist/esm/build/templates/pages.js { INNER_PAGE => \"[project]/node_modules/next/error.js [ssr] (ecmascript)\", INNER_DOCUMENT => \"[project]/src/pages/_document.tsx [ssr] (ecmascript)\", INNER_APP => \"[project]/src/pages/_app.tsx [ssr] (ecmascript)\" } [ssr] (ecmascript)", CHUNK_PUBLIC_PATH).exports;
