(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/[root of the server]__dde80f._.js", {

"[turbopack]/browser/dev/hmr-client/websocket.ts [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, z: __turbopack_require_stub__ } = __turbopack_context__;
{
// Adapted from https://github.com/vercel/next.js/blob/canary/packages/next/src/client/dev/error-overlay/websocket.ts
__turbopack_esm__({
    "addMessageListener": (()=>addMessageListener),
    "connectHMR": (()=>connectHMR),
    "sendMessage": (()=>sendMessage)
});
let source;
const eventCallbacks = [];
// TODO: add timeout again
// let lastActivity = Date.now()
function getSocketProtocol(assetPrefix) {
    let protocol = location.protocol;
    try {
        // assetPrefix is a url
        protocol = new URL(assetPrefix).protocol;
    } catch (_) {}
    return protocol === "http:" ? "ws" : "wss";
}
function addMessageListener(cb) {
    eventCallbacks.push(cb);
}
function sendMessage(data) {
    if (!source || source.readyState !== source.OPEN) return;
    return source.send(data);
}
function connectHMR(options) {
    const { timeout = 5 * 1000 } = options;
    function init() {
        if (source) source.close();
        console.log("[HMR] connecting...");
        function handleOnline() {
            const connected = {
                type: "turbopack-connected"
            };
            eventCallbacks.forEach((cb)=>{
                cb(connected);
            });
            if (options.log) console.log("[HMR] connected");
        // lastActivity = Date.now()
        }
        function handleMessage(event) {
            // lastActivity = Date.now()
            const message = {
                type: "turbopack-message",
                data: JSON.parse(event.data)
            };
            eventCallbacks.forEach((cb)=>{
                cb(message);
            });
        }
        // let timer: NodeJS.Timeout
        function handleDisconnect() {
            source.close();
            setTimeout(init, timeout);
        }
        const { hostname, port } = location;
        const protocol = getSocketProtocol(options.assetPrefix || "");
        const assetPrefix = options.assetPrefix.replace(/^\/+/, "");
        let url = `${protocol}://${hostname}:${port}${assetPrefix ? `/${assetPrefix}` : ""}`;
        if (assetPrefix.startsWith("http")) {
            url = `${protocol}://${assetPrefix.split("://")[1]}`;
        }
        source = new window.WebSocket(`${url}${options.path}`);
        source.onopen = handleOnline;
        source.onerror = handleDisconnect;
        source.onmessage = handleMessage;
    }
    init();
}
}}),
"[turbopack]/browser/dev/hmr-client/hmr-client.ts [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, z: __turbopack_require_stub__ } = __turbopack_context__;
{
/// <reference path="../../../shared/runtime-types.d.ts" />
/// <reference path="../../runtime/base/dev-globals.d.ts" />
/// <reference path="../../runtime/base/dev-protocol.d.ts" />
/// <reference path="../../runtime/base/dev-extensions.ts" />
__turbopack_esm__({
    "connect": (()=>connect),
    "setHooks": (()=>setHooks),
    "subscribeToUpdate": (()=>subscribeToUpdate)
});
var __TURBOPACK__imported__module__$5b$turbopack$5d2f$browser$2f$dev$2f$hmr$2d$client$2f$websocket$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[turbopack]/browser/dev/hmr-client/websocket.ts [client] (ecmascript)");
;
function connect({ // TODO(WEB-1465) Remove this backwards compat fallback once
// vercel/next.js#54586 is merged.
addMessageListener = __TURBOPACK__imported__module__$5b$turbopack$5d2f$browser$2f$dev$2f$hmr$2d$client$2f$websocket$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["addMessageListener"], // TODO(WEB-1465) Remove this backwards compat fallback once
// vercel/next.js#54586 is merged.
sendMessage = __TURBOPACK__imported__module__$5b$turbopack$5d2f$browser$2f$dev$2f$hmr$2d$client$2f$websocket$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["sendMessage"], onUpdateError = console.error }) {
    addMessageListener((msg)=>{
        switch(msg.type){
            case "turbopack-connected":
                handleSocketConnected(sendMessage);
                break;
            default:
                try {
                    if (Array.isArray(msg.data)) {
                        for(let i = 0; i < msg.data.length; i++){
                            handleSocketMessage(msg.data[i]);
                        }
                    } else {
                        handleSocketMessage(msg.data);
                    }
                    applyAggregatedUpdates();
                } catch (e) {
                    console.warn("[Fast Refresh] performing full reload\n\n" + "Fast Refresh will perform a full reload when you edit a file that's imported by modules outside of the React rendering tree.\n" + "You might have a file which exports a React component but also exports a value that is imported by a non-React component file.\n" + "Consider migrating the non-React component export to a separate file and importing it into both files.\n\n" + "It is also possible the parent component of the component you edited is a class component, which disables Fast Refresh.\n" + "Fast Refresh requires at least one parent function component in your React tree.");
                    onUpdateError(e);
                    location.reload();
                }
                break;
        }
    });
    const queued = globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS;
    if (queued != null && !Array.isArray(queued)) {
        throw new Error("A separate HMR handler was already registered");
    }
    globalThis.TURBOPACK_CHUNK_UPDATE_LISTENERS = {
        push: ([chunkPath, callback])=>{
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    };
    if (Array.isArray(queued)) {
        for (const [chunkPath, callback] of queued){
            subscribeToChunkUpdate(chunkPath, sendMessage, callback);
        }
    }
}
const updateCallbackSets = new Map();
function sendJSON(sendMessage, message) {
    sendMessage(JSON.stringify(message));
}
function resourceKey(resource) {
    return JSON.stringify({
        path: resource.path,
        headers: resource.headers || null
    });
}
function subscribeToUpdates(sendMessage, resource) {
    sendJSON(sendMessage, {
        type: "turbopack-subscribe",
        ...resource
    });
    return ()=>{
        sendJSON(sendMessage, {
            type: "turbopack-unsubscribe",
            ...resource
        });
    };
}
function handleSocketConnected(sendMessage) {
    for (const key of updateCallbackSets.keys()){
        subscribeToUpdates(sendMessage, JSON.parse(key));
    }
}
// we aggregate all pending updates until the issues are resolved
const chunkListsWithPendingUpdates = new Map();
function aggregateUpdates(msg) {
    const key = resourceKey(msg.resource);
    let aggregated = chunkListsWithPendingUpdates.get(key);
    if (aggregated) {
        aggregated.instruction = mergeChunkListUpdates(aggregated.instruction, msg.instruction);
    } else {
        chunkListsWithPendingUpdates.set(key, msg);
    }
}
function applyAggregatedUpdates() {
    if (chunkListsWithPendingUpdates.size === 0) return;
    hooks.beforeRefresh();
    for (const msg of chunkListsWithPendingUpdates.values()){
        triggerUpdate(msg);
    }
    chunkListsWithPendingUpdates.clear();
    finalizeUpdate();
}
function mergeChunkListUpdates(updateA, updateB) {
    let chunks;
    if (updateA.chunks != null) {
        if (updateB.chunks == null) {
            chunks = updateA.chunks;
        } else {
            chunks = mergeChunkListChunks(updateA.chunks, updateB.chunks);
        }
    } else if (updateB.chunks != null) {
        chunks = updateB.chunks;
    }
    let merged;
    if (updateA.merged != null) {
        if (updateB.merged == null) {
            merged = updateA.merged;
        } else {
            // Since `merged` is an array of updates, we need to merge them all into
            // one, consistent update.
            // Since there can only be `EcmascriptMergeUpdates` in the array, there is
            // no need to key on the `type` field.
            let update = updateA.merged[0];
            for(let i = 1; i < updateA.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateA.merged[i]);
            }
            for(let i = 0; i < updateB.merged.length; i++){
                update = mergeChunkListEcmascriptMergedUpdates(update, updateB.merged[i]);
            }
            merged = [
                update
            ];
        }
    } else if (updateB.merged != null) {
        merged = updateB.merged;
    }
    return {
        type: "ChunkListUpdate",
        chunks,
        merged
    };
}
function mergeChunkListChunks(chunksA, chunksB) {
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    return chunks;
}
function mergeChunkUpdates(updateA, updateB) {
    if (updateA.type === "added" && updateB.type === "deleted" || updateA.type === "deleted" && updateB.type === "added") {
        return undefined;
    }
    if (updateA.type === "partial") {
        invariant(updateA.instruction, "Partial updates are unsupported");
    }
    if (updateB.type === "partial") {
        invariant(updateB.instruction, "Partial updates are unsupported");
    }
    return undefined;
}
function mergeChunkListEcmascriptMergedUpdates(mergedA, mergedB) {
    const entries = mergeEcmascriptChunkEntries(mergedA.entries, mergedB.entries);
    const chunks = mergeEcmascriptChunksUpdates(mergedA.chunks, mergedB.chunks);
    return {
        type: "EcmascriptMergedUpdate",
        entries,
        chunks
    };
}
function mergeEcmascriptChunkEntries(entriesA, entriesB) {
    return {
        ...entriesA,
        ...entriesB
    };
}
function mergeEcmascriptChunksUpdates(chunksA, chunksB) {
    if (chunksA == null) {
        return chunksB;
    }
    if (chunksB == null) {
        return chunksA;
    }
    const chunks = {};
    for (const [chunkPath, chunkUpdateA] of Object.entries(chunksA)){
        const chunkUpdateB = chunksB[chunkPath];
        if (chunkUpdateB != null) {
            const mergedUpdate = mergeEcmascriptChunkUpdates(chunkUpdateA, chunkUpdateB);
            if (mergedUpdate != null) {
                chunks[chunkPath] = mergedUpdate;
            }
        } else {
            chunks[chunkPath] = chunkUpdateA;
        }
    }
    for (const [chunkPath, chunkUpdateB] of Object.entries(chunksB)){
        if (chunks[chunkPath] == null) {
            chunks[chunkPath] = chunkUpdateB;
        }
    }
    if (Object.keys(chunks).length === 0) {
        return undefined;
    }
    return chunks;
}
function mergeEcmascriptChunkUpdates(updateA, updateB) {
    if (updateA.type === "added" && updateB.type === "deleted") {
        // These two completely cancel each other out.
        return undefined;
    }
    if (updateA.type === "deleted" && updateB.type === "added") {
        const added = [];
        const deleted = [];
        const deletedModules = new Set(updateA.modules ?? []);
        const addedModules = new Set(updateB.modules ?? []);
        for (const moduleId of addedModules){
            if (!deletedModules.has(moduleId)) {
                added.push(moduleId);
            }
        }
        for (const moduleId of deletedModules){
            if (!addedModules.has(moduleId)) {
                deleted.push(moduleId);
            }
        }
        if (added.length === 0 && deleted.length === 0) {
            return undefined;
        }
        return {
            type: "partial",
            added,
            deleted
        };
    }
    if (updateA.type === "partial" && updateB.type === "partial") {
        const added = new Set([
            ...updateA.added ?? [],
            ...updateB.added ?? []
        ]);
        const deleted = new Set([
            ...updateA.deleted ?? [],
            ...updateB.deleted ?? []
        ]);
        if (updateB.added != null) {
            for (const moduleId of updateB.added){
                deleted.delete(moduleId);
            }
        }
        if (updateB.deleted != null) {
            for (const moduleId of updateB.deleted){
                added.delete(moduleId);
            }
        }
        return {
            type: "partial",
            added: [
                ...added
            ],
            deleted: [
                ...deleted
            ]
        };
    }
    if (updateA.type === "added" && updateB.type === "partial") {
        const modules = new Set([
            ...updateA.modules ?? [],
            ...updateB.added ?? []
        ]);
        for (const moduleId of updateB.deleted ?? []){
            modules.delete(moduleId);
        }
        return {
            type: "added",
            modules: [
                ...modules
            ]
        };
    }
    if (updateA.type === "partial" && updateB.type === "deleted") {
        // We could eagerly return `updateB` here, but this would potentially be
        // incorrect if `updateA` has added modules.
        const modules = new Set(updateB.modules ?? []);
        if (updateA.added != null) {
            for (const moduleId of updateA.added){
                modules.delete(moduleId);
            }
        }
        return {
            type: "deleted",
            modules: [
                ...modules
            ]
        };
    }
    // Any other update combination is invalid.
    return undefined;
}
function invariant(_, message) {
    throw new Error(`Invariant: ${message}`);
}
const CRITICAL = [
    "bug",
    "error",
    "fatal"
];
function compareByList(list, a, b) {
    const aI = list.indexOf(a) + 1 || list.length;
    const bI = list.indexOf(b) + 1 || list.length;
    return aI - bI;
}
const chunksWithIssues = new Map();
function emitIssues() {
    const issues = [];
    const deduplicationSet = new Set();
    for (const [_, chunkIssues] of chunksWithIssues){
        for (const chunkIssue of chunkIssues){
            if (deduplicationSet.has(chunkIssue.formatted)) continue;
            issues.push(chunkIssue);
            deduplicationSet.add(chunkIssue.formatted);
        }
    }
    sortIssues(issues);
    hooks.issues(issues);
}
function handleIssues(msg) {
    const key = resourceKey(msg.resource);
    let hasCriticalIssues = false;
    for (const issue of msg.issues){
        if (CRITICAL.includes(issue.severity)) {
            hasCriticalIssues = true;
        }
    }
    if (msg.issues.length > 0) {
        chunksWithIssues.set(key, msg.issues);
    } else if (chunksWithIssues.has(key)) {
        chunksWithIssues.delete(key);
    }
    emitIssues();
    return hasCriticalIssues;
}
const SEVERITY_ORDER = [
    "bug",
    "fatal",
    "error",
    "warning",
    "info",
    "log"
];
const CATEGORY_ORDER = [
    "parse",
    "resolve",
    "code generation",
    "rendering",
    "typescript",
    "other"
];
function sortIssues(issues) {
    issues.sort((a, b)=>{
        const first = compareByList(SEVERITY_ORDER, a.severity, b.severity);
        if (first !== 0) return first;
        return compareByList(CATEGORY_ORDER, a.category, b.category);
    });
}
const hooks = {
    beforeRefresh: ()=>{},
    refresh: ()=>{},
    buildOk: ()=>{},
    issues: (_issues)=>{}
};
function setHooks(newHooks) {
    Object.assign(hooks, newHooks);
}
function handleSocketMessage(msg) {
    sortIssues(msg.issues);
    handleIssues(msg);
    switch(msg.type){
        case "issues":
            break;
        case "partial":
            // aggregate updates
            aggregateUpdates(msg);
            break;
        default:
            // run single update
            const runHooks = chunkListsWithPendingUpdates.size === 0;
            if (runHooks) hooks.beforeRefresh();
            triggerUpdate(msg);
            if (runHooks) finalizeUpdate();
            break;
    }
}
function finalizeUpdate() {
    hooks.refresh();
    hooks.buildOk();
    // This is used by the Next.js integration test suite to notify it when HMR
    // updates have been completed.
    // TODO: Only run this in test environments (gate by `process.env.__NEXT_TEST_MODE`)
    if (globalThis.__NEXT_HMR_CB) {
        globalThis.__NEXT_HMR_CB();
        globalThis.__NEXT_HMR_CB = null;
    }
}
function subscribeToChunkUpdate(chunkPath, sendMessage, callback) {
    return subscribeToUpdate({
        path: chunkPath
    }, sendMessage, callback);
}
function subscribeToUpdate(resource, sendMessage, callback) {
    // TODO(WEB-1465) Remove this backwards compat fallback once
    // vercel/next.js#54586 is merged.
    if (callback === undefined) {
        callback = sendMessage;
        sendMessage = __TURBOPACK__imported__module__$5b$turbopack$5d2f$browser$2f$dev$2f$hmr$2d$client$2f$websocket$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["sendMessage"];
    }
    const key = resourceKey(resource);
    let callbackSet;
    const existingCallbackSet = updateCallbackSets.get(key);
    if (!existingCallbackSet) {
        callbackSet = {
            callbacks: new Set([
                callback
            ]),
            unsubscribe: subscribeToUpdates(sendMessage, resource)
        };
        updateCallbackSets.set(key, callbackSet);
    } else {
        existingCallbackSet.callbacks.add(callback);
        callbackSet = existingCallbackSet;
    }
    return ()=>{
        callbackSet.callbacks.delete(callback);
        if (callbackSet.callbacks.size === 0) {
            callbackSet.unsubscribe();
            updateCallbackSets.delete(key);
        }
    };
}
function triggerUpdate(msg) {
    const key = resourceKey(msg.resource);
    const callbackSet = updateCallbackSets.get(key);
    if (!callbackSet) {
        return;
    }
    for (const callback of callbackSet.callbacks){
        callback(msg);
    }
    if (msg.type === "notFound") {
        // This indicates that the resource which we subscribed to either does not exist or
        // has been deleted. In either case, we should clear all update callbacks, so if a
        // new subscription is created for the same resource, it will send a new "subscribe"
        // message to the server.
        // No need to send an "unsubscribe" message to the server, it will have already
        // dropped the update stream before sending the "notFound" message.
        updateCallbackSets.delete(key);
    }
}
}}),
"[project]/src/api-connection/service.ts [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/axios/lib/axios.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/build/polyfills/process.js [client] (ecmascript)");
;
const api = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].create({
    baseURL: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$client$5d$__$28$ecmascript$29$__["default"].env.BACKEND_URL || 'http://localhost:4000',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});
// Add request interceptor to include Clerk token from localStorage
api.interceptors.request.use(async (config)=>{
    if ("TURBOPACK compile-time falsy", 0) {
        "TURBOPACK unreachable";
    }
    // Get token from local storage
    const token = localStorage.getItem('token');
    const clerkOrgId = localStorage.getItem('currentOrganizationId');
    const dbOrgId = localStorage.getItem('dbOrganizationId');
    // Log request details for debugging
    console.log(`API ${config.method?.toUpperCase()} request to: ${config.url}`);
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        // Add organization context headers if available
        if (clerkOrgId) {
            // Always use Clerk ID for auth context
            config.headers['X-Organization-Id'] = clerkOrgId;
            console.log('Including Clerk organization ID:', clerkOrgId);
        }
        // For endpoints that need database ID format
        if (dbOrgId) {
            config.headers['X-DB-Organization-Id'] = dbOrgId;
            console.log('Including database organization ID:', dbOrgId);
        }
        // For subscriptions endpoints, prioritize using database ID in URL
        if (config.url && config.url.includes('/api/subscriptions/')) {
            // If URL ends with 'current' or ID is already embedded, don't modify
            if (!config.url.endsWith('/current') && !config.url.match(/\/api\/subscriptions\/[a-zA-Z0-9_-]+$/)) {
                // Use database ID if available, otherwise use Clerk ID
                const orgIdForUrl = dbOrgId || clerkOrgId;
                if (orgIdForUrl) {
                    config.url = `/api/subscriptions/${orgIdForUrl}`;
                    console.log('Using organization ID in URL:', orgIdForUrl);
                }
            }
        }
        // Log token for debugging (truncated for security)
        if (token.length > 20) {
            console.log('Using token:', token.substring(0, 15) + '...');
        }
    } else {
        console.warn('No authentication token found');
    }
    return config;
}, (error)=>{
    return Promise.reject(error);
});
// Add response interceptor for error handling
api.interceptors.response.use((response)=>{
    console.log(`API response from ${response.config.url}: Status ${response.status}`);
    // Only attempt to use localStorage on the client
    if ("TURBOPACK compile-time truthy", 1) {
        // Check for organization ID in response and save it
        if (response.data?.organization?.id) {
            // If the ID format suggests a database ID (UUID), save it
            if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(response.data.organization.id)) {
                console.log('Saving database organization ID from response:', response.data.organization.id);
                localStorage.setItem('dbOrganizationId', response.data.organization.id);
            }
            // If there's a clerkId field, save that too
            if (response.data.organization.clerkId) {
                console.log('Saving Clerk organization ID from response:', response.data.organization.clerkId);
                localStorage.setItem('currentOrganizationId', response.data.organization.clerkId);
            }
        }
    }
    return response;
}, (error)=>{
    console.error('API error:', error?.response?.data || error.message);
    // Only attempt to use localStorage and event dispatching on the client
    if ("TURBOPACK compile-time truthy", 1) {
        // Get organization context for better error handling
        const clerkOrgId = localStorage.getItem('currentOrganizationId');
        const dbOrgId = localStorage.getItem('dbOrganizationId');
        // Handle specific error conditions
        if (error.response?.status === 401) {
            // Unauthorized - token is invalid or missing
            console.error('Authentication error: Your session may have expired');
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        } else if (error.response?.status === 400) {
            // Organization access issue
            console.error('Request error:', error.response.data.message);
            // Log detailed request info for debugging
            console.error('Request URL:', error.config?.url);
            console.error('Request headers:', JSON.stringify({
                'Authorization': error.config?.headers?.Authorization ? 'Bearer [REDACTED]' : 'None',
                'X-Organization-Id': error.config?.headers?.['X-Organization-Id'] || 'None',
                'X-DB-Organization-Id': error.config?.headers?.['X-DB-Organization-Id'] || 'None'
            }));
            console.log('Request details:', {
                method: error.config?.method,
                params: error.config?.params,
                data: error.config?.data
            });
            console.log('Organization IDs:', {
                clerkId: clerkOrgId,
                dbId: dbOrgId
            });
            // If error is organization related, check auth state
            if (error.response?.data?.message?.includes('organization')) {
                window.dispatchEvent(new CustomEvent('org:accessdenied', {
                    detail: {
                        message: error.response.data.message
                    }
                }));
            }
        }
    }
    return Promise.reject(error);
});
const __TURBOPACK__default__export__ = api;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/api-connection/subscriptions.ts [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__),
    "subscriptionService": (()=>subscriptionService)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2d$connection$2f$service$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/api-connection/service.ts [client] (ecmascript)");
;
const subscriptionService = {
    // Get current user's subscription
    getCurrentSubscription: async ()=>{
        console.log('Fetching current subscription...');
        // First check if we have the required data
        if ("TURBOPACK compile-time falsy", 0) {
            "TURBOPACK unreachable";
        }
        const token = localStorage.getItem('token');
        const orgId = localStorage.getItem('currentOrganizationId'); // Clerk organization ID
        const dbOrgId = localStorage.getItem('dbOrganizationId'); // Database organization ID
        if (!token) {
            console.error('No token available for subscription request');
            throw new Error('Authentication token is missing');
        }
        if (!orgId) {
            console.error('No organization ID available for subscription request');
            throw new Error('Organization ID is missing');
        }
        console.log('Making API call with organization:', orgId);
        // Call different endpoint that doesn't rely on header
        try {
            // Try the direct endpoint with organization ID parameter - prioritize database ID
            if (dbOrgId) {
                console.log('Using database organization ID for API call:', dbOrgId);
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2d$connection$2f$service$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["default"].get(`/api/subscriptions/${dbOrgId}`);
                console.log('Subscription API response:', response.status);
                return response.data;
            } else {
                // Fall back to Clerk ID if database ID is not available
                console.log('Using Clerk organization ID for API call:', orgId);
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2d$connection$2f$service$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["default"].get(`/api/subscriptions/${orgId}`);
                console.log('Subscription API response:', response.status);
                return response.data;
            }
        } catch (error) {
            console.error('Failed to get subscription by ID, falling back to current endpoint:', error);
            // Fall back to the current endpoint
            try {
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2d$connection$2f$service$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["default"].get('/api/subscriptions/current');
                console.log('Fallback subscription API response:', response.status);
                return response.data;
            } catch (error) {
                handleSubscriptionError(error);
                throw error;
            }
        }
    },
    // Create a checkout session
    createCheckoutSession: async (priceId)=>{
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2d$connection$2f$service$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["default"].post('/api/subscriptions/create-checkout', {
                priceId
            });
            return response.data;
        } catch (error) {
            console.error('Failed to create checkout session:', error);
            throw error;
        }
    },
    // Cancel subscription
    cancelSubscription: async (subscriptionId)=>{
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2d$connection$2f$service$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["default"].put(`/api/subscriptions/${subscriptionId}/cancel`);
            return response.data;
        } catch (error) {
            console.error('Failed to cancel subscription:', error);
            throw error;
        }
    },
    // Get available subscription plans
    getSubscriptionPlans: async ()=>{
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2d$connection$2f$service$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["default"].get('/api/subscriptions/plans');
            return response.data;
        } catch (error) {
            console.error('Failed to get subscription plans:', error);
            throw error;
        }
    }
};
// Helper function to handle subscription errors
function handleSubscriptionError(error) {
    console.error('Subscription error:', error?.response?.data || error.message);
    // Provide more specific error messages
    if (error.response?.status === 401) {
        throw new Error('Your session has expired. Please sign in again.');
    } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to access this subscription.');
    } else if (error.response?.status === 404) {
        throw new Error('Subscription not found. You may need to subscribe first.');
    } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
    }
}
const __TURBOPACK__default__export__ = subscriptionService;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/ui/SignOutComponent/SignOutComponent.tsx [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/@clerk/shared/dist/react/index.mjs [client] (ecmascript)");
;
var _s = __turbopack_refresh__.signature();
'use client';
;
const SignOutComponent = ()=>{
    _s();
    const { signOut } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["useClerk"])();
    return(// Clicking this button signs out a user
    // and redirects them to the home page "/".
    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: ()=>signOut({
                redirectUrl: '/'
            }),
        children: "Sign out"
    }, void 0, false, {
        fileName: "[project]/src/components/ui/SignOutComponent/SignOutComponent.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this));
};
_s(SignOutComponent, "Rf+fvkPn6mtO1173eSP7ggvG0IU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["useClerk"]
    ];
});
_c = SignOutComponent;
const __TURBOPACK__default__export__ = SignOutComponent;
var _c;
__turbopack_refresh__.register(_c, "SignOutComponent");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/pages/[tenantId]/dashboard/index.tsx [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/react/jsx-dev-runtime.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2d$connection$2f$subscriptions$2e$ts__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/api-connection/subscriptions.ts [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$SignOutComponent$2f$SignOutComponent$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/components/ui/SignOutComponent/SignOutComponent.tsx [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/react/index.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/router.js [client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/@clerk/shared/dist/react/index.mjs [client] (ecmascript)");
;
var _s = __turbopack_refresh__.signature();
'use client';
;
;
;
;
;
const DashboardPage = ()=>{
    _s();
    const [subscription, setSubscription] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [debugInfo, setDebugInfo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [apiTestResult, setApiTestResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [apiTestLoading, setApiTestLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const { organization, isLoaded: orgLoaded } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["useOrganization"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { tenantId } = router.query;
    const redirectAttempted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const subscriptionRequested = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    // Initialize state without localStorage
    const [dbOrgId, setDbOrgId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Load localStorage values only on client
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DashboardPage.useEffect": ()=>{
            // This code only runs on the client
            const savedOrgId = localStorage.getItem('dbOrganizationId');
            if (savedOrgId) {
                setDbOrgId(savedOrgId);
            }
        }
    }["DashboardPage.useEffect"], []);
    // Force Clerk organization context into localStorage
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DashboardPage.useEffect": ()=>{
            if (orgLoaded && organization?.id) {
                // Always ensure the organization ID from Clerk is in localStorage
                localStorage.setItem('currentOrganizationId', organization.id);
                console.log('Set organization ID from Clerk:', organization.id);
            }
        }
    }["DashboardPage.useEffect"], [
        orgLoaded,
        organization
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$index$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DashboardPage.useEffect": ()=>{
            // Safe way to access localStorage in Next.js
            const getLocalStorageData = {
                "DashboardPage.useEffect.getLocalStorageData": ()=>{
                    if ("TURBOPACK compile-time falsy", 0) {
                        "TURBOPACK unreachable";
                    }
                    return {
                        token: localStorage.getItem('token') ? 'Present' : 'Missing',
                        clerkOrgId: localStorage.getItem('currentOrganizationId') || 'None',
                        dbOrgId: localStorage.getItem('dbOrganizationId') || 'None'
                    };
                }
            }["DashboardPage.useEffect.getLocalStorageData"];
            const getPathData = {
                "DashboardPage.useEffect.getPathData": ()=>{
                    return ("TURBOPACK compile-time truthy", 1) ? window.location.pathname : ("TURBOPACK unreachable", undefined);
                }
            }["DashboardPage.useEffect.getPathData"];
            // Update debug info
            setDebugInfo({
                organizationLoaded: orgLoaded,
                organizationId: organization?.id || 'None',
                databaseOrgId: dbOrgId || (("TURBOPACK compile-time truthy", 1) ? localStorage.getItem('dbOrganizationId') : ("TURBOPACK unreachable", undefined)) || 'None',
                tenantId: tenantId || 'None',
                redirectAttempted: redirectAttempted.current,
                subscriptionRequested: subscriptionRequested.current,
                localStorage: getLocalStorageData() || 'No window',
                path: getPathData()
            });
            // Don't proceed until Clerk organization is loaded
            if (!orgLoaded) {
                return;
            }
            // Handle URL with template placeholder
            if (tenantId === '{organizationId}' && organization?.id && !redirectAttempted.current) {
                redirectAttempted.current = true;
                // Try to redirect to correct URL
                try {
                    const correctPath = window.location.pathname.replace('{organizationId}', organization.id);
                    console.log('Redirecting to correct path with organization ID:', correctPath);
                    router.push(correctPath);
                    return;
                } catch (err) {
                    console.error('Failed to redirect:', err);
                // Continue with template URL but use Clerk organization
                }
            }
            // If we have organization context, fetch subscription (but only once)
            if (organization?.id && !subscriptionRequested.current) {
                console.log('Fetching subscription using organization from Clerk:', organization.id);
                subscriptionRequested.current = true;
                fetchSubscription();
            } else if (tenantId && typeof tenantId === 'string' && tenantId.startsWith('org_') && !subscriptionRequested.current) {
                console.log('Fetching subscription using organization from URL:', tenantId);
                localStorage.setItem('currentOrganizationId', tenantId);
                subscriptionRequested.current = true;
                fetchSubscription();
            } else if ("object" !== 'undefined' && localStorage.getItem('currentOrganizationId') && !subscriptionRequested.current) {
                console.log('Fetching subscription using organization from localStorage');
                subscriptionRequested.current = true;
                fetchSubscription();
            } else if (subscriptionRequested.current && !loading && !subscription) {
                setError("No organization context available or subscription could not be loaded");
            }
        }
    }["DashboardPage.useEffect"], [
        orgLoaded,
        organization,
        tenantId,
        router,
        loading,
        subscription,
        dbOrgId
    ]);
    const fetchSubscription = async ()=>{
        // Don't attempt to fetch on server
        if ("TURBOPACK compile-time falsy", 0) {
            "TURBOPACK unreachable";
        }
        setLoading(true);
        setError(null);
        try {
            // Use the Clerk organization ID directly
            if (organization?.id) {
                console.log('Using organization ID from Clerk for API call:', organization.id);
                localStorage.setItem('currentOrganizationId', organization.id);
            }
            // Get or sync database organization ID if needed
            const currentDbOrgId = dbOrgId || localStorage.getItem('dbOrganizationId');
            if (!currentDbOrgId && organization?.id) {
                console.log('No database organization ID available - trying to sync user profile first');
                try {
                    await testCreateOrganization();
                    // Small delay to ensure new ID is saved
                    await new Promise((resolve)=>setTimeout(resolve, 500));
                } catch (err) {
                    console.error('Failed to sync user profile:', err);
                }
            }
            // Small delay to ensure localStorage is set
            await new Promise((resolve)=>setTimeout(resolve, 300));
            const subscription = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2d$connection$2f$subscriptions$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["default"].getCurrentSubscription();
            console.log('Subscription loaded:', subscription);
            setSubscription(subscription);
        } catch (err) {
            console.error("Error fetching subscription:", err);
            const errorMessage = err?.response?.data?.message || err.message || "Failed to load subscription details";
            setError(errorMessage);
            // Check for token issues
            if ("object" !== 'undefined' && !localStorage.getItem('token')) {
                setError('Authentication token is missing. Try signing in again.');
            }
        } finally{
            setLoading(false);
        }
    };
    const handleRetry = ()=>{
        // Reset subscription request flag
        subscriptionRequested.current = false;
        // Refresh the token first
        if ("object" !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(new Event('refresh-token'));
        }
        // Then retry the subscription fetch after a short delay
        setTimeout(()=>{
            fetchSubscription();
        }, 500);
    };
    // Test creating organization in the database
    const testCreateOrganization = async ()=>{
        // Don't attempt to call on server
        if ("TURBOPACK compile-time falsy", 0) {
            "TURBOPACK unreachable";
        }
        setApiTestLoading(true);
        setApiTestResult(null);
        try {
            const orgId = organization?.id || localStorage.getItem('currentOrganizationId');
            const token = localStorage.getItem('token');
            if (!orgId || !token) {
                throw new Error('Missing required organization ID or token');
            }
            // Try to sync the user info first - this should create the organization as a side effect
            const response = await fetch('http://localhost:4000/api/auth/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-Organization-Id': orgId
                }
            });
            const responseText = await response.text();
            let responseData;
            try {
                responseData = JSON.parse(responseText);
            } catch (e) {
                responseData = {
                    text: responseText
                };
            }
            // Save the database organization ID
            if (responseData?.organization?.id) {
                localStorage.setItem('dbOrganizationId', responseData.organization.id);
                setDbOrgId(responseData.organization.id);
                console.log('Saved database organization ID:', responseData.organization.id);
            }
            setApiTestResult({
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries([
                    ...response.headers.entries()
                ]),
                data: responseData
            });
            // After syncing, try to get subscription again
            if (response.ok) {
                setTimeout(()=>{
                    subscriptionRequested.current = false;
                    fetchSubscription();
                }, 1000);
            }
        } catch (err) {
            setApiTestResult({
                error: err.message,
                stack: err.stack
            });
        } finally{
            setApiTestLoading(false);
        }
    };
    // Direct API testing function
    const testDirectApiCall = async ()=>{
        // Don't attempt to call on server
        if ("TURBOPACK compile-time falsy", 0) {
            "TURBOPACK unreachable";
        }
        setApiTestLoading(true);
        setApiTestResult(null);
        try {
            // Use database organization ID if available (important!)
            const orgId = dbOrgId || localStorage.getItem('dbOrganizationId') || organization?.id || localStorage.getItem('currentOrganizationId');
            const token = localStorage.getItem('token');
            if (!orgId || !token) {
                throw new Error('Missing required organization ID or token');
            }
            console.log('Making direct API call with organization ID:', orgId);
            // Make a direct fetch request
            const response = await fetch(`http://localhost:4000/api/subscriptions/${orgId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-Organization-Id': organization?.id || localStorage.getItem('currentOrganizationId') || ''
                }
            });
            const responseText = await response.text();
            let responseData;
            try {
                responseData = JSON.parse(responseText);
            } catch (e) {
                responseData = {
                    text: responseText
                };
            }
            setApiTestResult({
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries([
                    ...response.headers.entries()
                ]),
                data: responseData
            });
            // If successful, update subscription state
            if (response.ok && responseData?.subscription) {
                setSubscription(responseData.subscription);
            }
        } catch (err) {
            setApiTestResult({
                error: err.message,
                stack: err.stack
            });
        } finally{
            setApiTestLoading(false);
        }
    };
    // Try verifying token directly first
    const testTokenVerification = async ()=>{
        // Don't attempt to call on server
        if ("TURBOPACK compile-time falsy", 0) {
            "TURBOPACK unreachable";
        }
        setApiTestLoading(true);
        setApiTestResult(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Missing token');
            }
            // Try verifying the token directly
            const response = await fetch('http://localhost:4000/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token
                })
            });
            const responseText = await response.text();
            let responseData;
            try {
                responseData = JSON.parse(responseText);
            } catch (e) {
                responseData = {
                    text: responseText
                };
            }
            setApiTestResult({
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries([
                    ...response.headers.entries()
                ]),
                data: responseData
            });
            // If token verification succeeded, refresh debug info
            if (response.ok && responseData?.success) {
                setTimeout(()=>{
                    // Force the organization info to localStorage
                    if (responseData?.organization?.id) {
                        localStorage.setItem('currentOrganizationId', responseData.organization.id);
                    }
                    // Retry subscription fetch
                    subscriptionRequested.current = false;
                    fetchSubscription();
                }, 1000);
            }
        } catch (err) {
            setApiTestResult({
                error: err.message,
                stack: err.stack
            });
        } finally{
            setApiTestLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-2xl font-bold mb-4",
                children: "Dashboard"
            }, void 0, false, {
                fileName: "[project]/src/pages/[tenantId]/dashboard/index.tsx",
                lineNumber: 372,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$SignOutComponent$2f$SignOutComponent$2e$tsx__$5b$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/pages/[tenantId]/dashboard/index.tsx",
                lineNumber: 373,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-6 p-4 border rounded-lg bg-white shadow",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-semibold mb-2",
                        children: "Subscription"
                    }, void 0, false, {
                        fileName: "[project]/src/pages/[tenantId]/dashboard/index.tsx",
                        lineNumber: 376,
                        columnNumber: 17
                    }, this),
                    !orgLoaded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Loading organization data..."
                    }, void 0, false, {
                        fileName: "[project]/src/pages/[tenantId]/dashboard/index.tsx",
                        lineNumber: 378,
                        columnNumber: 32
                    }, this),
                    loading && orgLoaded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Loading subscription information..."
                    }, void 0, false, {
                        fileName: "[project]/src/pages/[tenantId]/dashboard/index.tsx",
                        lineNumber: 380,
                        columnNumber: 42
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-red-50 text-red-600 p-3 rounded mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: error
                            }, void 0, false, {
                                fileName: "[project]/src/pages/[tenantId]/dashboard/index.tsx",
                                lineNumber: 384,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleRetry,
                                className: "mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm",
                                children: "Retry"
                            }, void 0, false, {
                                fileName: "[project]/src/pages/[tenantId]/dashboard/index.tsx",
                                lineNumber: 385,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/pages/[tenantId]/dashboard/index.tsx",
                        lineNumber: 383,
                        columnNumber: 21
                    }, this),
                    !loading && !error && subscription && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mb-2",
                                children: [
                                    "Status: ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-medium",
                                        children: subscription?.status
                                    }, void 0, false, {
                                        fileName: "[project]/src/pages/[tenantId]/dashboard/index.tsx",
                                        lineNumber: 396,
                                        columnNumber: 53
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/pages/[tenantId]/dashboard/index.tsx",
                                lineNumber: 396,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                className: "bg-gray-50 p-2 rounded text-xs mt-4 overflow-auto max-h-40",
                                children: JSON.stringify(subscription, null, 2)
                            }, void 0, false, {
                                fileName: "[project]/src/pages/[tenantId]/dashboard/index.tsx",
                                lineNumber: 397,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/pages/[tenantId]/dashboard/index.tsx",
                        lineNumber: 395,
                        columnNumber: 21
                    }, this),
                    !loading && !error && !subscription && orgLoaded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "No subscription found for this organization."
                    }, void 0, false, {
                        fileName: "[project]/src/pages/[tenantId]/dashboard/index.tsx",
                        lineNumber: 404,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/pages/[tenantId]/dashboard/index.tsx",
                lineNumber: 375,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-6 p-4 border rounded-lg bg-white shadow",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-semibold mb-2",
                        children: "API Diagnostics"
                    }, void 0, false, {
                        fileName: "[project]/src/pages/[tenantId]/dashboard/index.tsx",
                        lineNumber: 410,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2 mb-3 flex-wrap",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: testDirectApiCall,
                                disabled: apiTestLoading,
                                className: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm",
                                children: apiTestLoading ? 'Testing...' : 'Test Direct API Call'
                            }, void 0, false, {
                                fileName: "[project]/src/pages/[tenantId]/dashboard/index.tsx",
                                lineNumber: 412,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: testCreateOrganization,
                                disabled: apiTestLoading,
                                className: "bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm",
                                children: apiTestLoading ? 'Processing...' : 'Sync User Profile'
                            }, void 0, false, {
                                fileName: "[project]/src/pages/[tenantId]/dashboard/index.tsx",
                                lineNumber: 420,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: testTokenVerification,
                                disabled: apiTestLoading,
                                className: "bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 text-sm",
                                children: apiTestLoading ? 'Processing...' : 'Verify Token'
                            }, void 0, false, {
                                fileName: "[project]/src/pages/[tenantId]/dashboard/index.tsx",
                                lineNumber: 428,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/pages/[tenantId]/dashboard/index.tsx",
                        lineNumber: 411,
                        columnNumber: 17
                    }, this),
                    apiTestResult && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-md font-medium",
                                children: "API Response:"
                            }, void 0, false, {
                                fileName: "[project]/src/pages/[tenantId]/dashboard/index.tsx",
                                lineNumber: 439,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                className: "bg-gray-50 p-2 rounded text-xs mt-2 overflow-auto max-h-80",
                                children: JSON.stringify(apiTestResult, null, 2)
                            }, void 0, false, {
                                fileName: "[project]/src/pages/[tenantId]/dashboard/index.tsx",
                                lineNumber: 440,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/pages/[tenantId]/dashboard/index.tsx",
                        lineNumber: 438,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/pages/[tenantId]/dashboard/index.tsx",
                lineNumber: 409,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-6 p-4 border border-gray-300 rounded-lg bg-gray-50",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-sm font-bold mb-2 text-gray-700",
                        children: "Debug Info"
                    }, void 0, false, {
                        fileName: "[project]/src/pages/[tenantId]/dashboard/index.tsx",
                        lineNumber: 449,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                        className: "text-xs overflow-auto max-h-40",
                        children: JSON.stringify(debugInfo, null, 2)
                    }, void 0, false, {
                        fileName: "[project]/src/pages/[tenantId]/dashboard/index.tsx",
                        lineNumber: 450,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/pages/[tenantId]/dashboard/index.tsx",
                lineNumber: 448,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/pages/[tenantId]/dashboard/index.tsx",
        lineNumber: 371,
        columnNumber: 9
    }, this);
};
_s(DashboardPage, "CUsdSJSEkQLevuQBZMVr4plnxbg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$client$5d$__$28$ecmascript$29$__["useOrganization"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = DashboardPage;
const __TURBOPACK__default__export__ = DashboardPage;
var _c;
__turbopack_refresh__.register(_c, "DashboardPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[next]/entry/page-loader.ts { PAGE => \"[project]/src/pages/[tenantId]/dashboard/index.tsx [client] (ecmascript)\" } [client] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
const PAGE_PATH = "/[tenantId]/dashboard";
(window.__NEXT_P = window.__NEXT_P || []).push([
    PAGE_PATH,
    ()=>{
        return __turbopack_require__("[project]/src/pages/[tenantId]/dashboard/index.tsx [client] (ecmascript)");
    }
]);
// @ts-expect-error module.hot exists
if (module.hot) {
    // @ts-expect-error module.hot exists
    module.hot.dispose(function() {
        window.__NEXT_P.push([
            PAGE_PATH
        ]);
    });
}
}}),
"[project]/src/pages/[tenantId]/dashboard/index.tsx (hmr-entry)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, m: module, t: __turbopack_require_real__ } = __turbopack_context__;
{
__turbopack_require__("[next]/entry/page-loader.ts { PAGE => \"[project]/src/pages/[tenantId]/dashboard/index.tsx [client] (ecmascript)\" } [client] (ecmascript)");
}}),
}]);

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__dde80f._.js.map