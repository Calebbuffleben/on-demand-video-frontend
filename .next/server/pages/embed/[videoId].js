const CHUNK_PUBLIC_PATH = "server/pages/embed/[videoId].js";
const runtime = require("../../chunks/ssr/[turbopack]_runtime.js");
runtime.loadChunk("server/chunks/ssr/node_modules_064b26._.js");
runtime.loadChunk("server/chunks/ssr/[root of the server]__86a74d._.js");
runtime.loadChunk("server/chunks/ssr/src_styles_globals_070f83.css");
runtime.loadChunk("server/chunks/ssr/[root of the server]__e97e09._.js");
module.exports = runtime.getOrInstantiateRuntimeModule("[project]/node_modules/next/dist/esm/build/templates/pages.js { INNER_PAGE => \"[project]/src/pages/embed/[videoId].tsx [ssr] (ecmascript)\", INNER_DOCUMENT => \"[project]/src/pages/_document.tsx [ssr] (ecmascript)\", INNER_APP => \"[project]/src/pages/_app.tsx [ssr] (ecmascript)\" } [ssr] (ecmascript)", CHUNK_PUBLIC_PATH).exports;
