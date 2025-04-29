module.exports = {

"[externals]/axios [external] (axios, esm_import)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, a: __turbopack_async_module__, x: __turbopack_external_require__, y: __turbopack_external_import__, z: __turbopack_require_stub__ } = __turbopack_context__;
__turbopack_async_module__(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
const mod = await __turbopack_external_import__("axios");

__turbopack_export_namespace__(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/src/api-connection/service.ts [ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, a: __turbopack_async_module__, x: __turbopack_external_require__, y: __turbopack_external_import__, z: __turbopack_require_stub__ } = __turbopack_context__;
__turbopack_async_module__(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$externals$5d2f$axios__$5b$external$5d$__$28$axios$2c$__esm_import$29$__ = __turbopack_import__("[externals]/axios [external] (axios, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$axios__$5b$external$5d$__$28$axios$2c$__esm_import$29$__
]);
([__TURBOPACK__imported__module__$5b$externals$5d2f$axios__$5b$external$5d$__$28$axios$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__);
;
const api = __TURBOPACK__imported__module__$5b$externals$5d2f$axios__$5b$external$5d$__$28$axios$2c$__esm_import$29$__["default"].create({
    baseURL: process.env.BACKEND_URL || 'http://localhost:4000',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});
// Add request interceptor to include Clerk token from localStorage
api.interceptors.request.use(async (config)=>{
    if ("TURBOPACK compile-time truthy", 1) {
        // We're on the server, so don't attempt to use localStorage
        console.log('API request on server side - skipping auth token');
        return config;
    }
    "TURBOPACK unreachable";
    // Get token from local storage
    const token = undefined;
    const clerkOrgId = undefined;
    const dbOrgId = undefined;
}, (error)=>{
    return Promise.reject(error);
});
// Add response interceptor for error handling
api.interceptors.response.use((response)=>{
    console.log(`API response from ${response.config.url}: Status ${response.status}`);
    // Only attempt to use localStorage on the client
    if ("TURBOPACK compile-time falsy", 0) {
        "TURBOPACK unreachable";
    }
    return response;
}, (error)=>{
    console.error('API error:', error?.response?.data || error.message);
    // Only attempt to use localStorage and event dispatching on the client
    if ("TURBOPACK compile-time falsy", 0) {
        "TURBOPACK unreachable";
    }
    return Promise.reject(error);
});
const __TURBOPACK__default__export__ = api;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/api-connection/subscriptions.ts [ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, a: __turbopack_async_module__, x: __turbopack_external_require__, y: __turbopack_external_import__, z: __turbopack_require_stub__ } = __turbopack_context__;
__turbopack_async_module__(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__),
    "subscriptionService": (()=>subscriptionService)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2d$connection$2f$service$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/api-connection/service.ts [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2d$connection$2f$service$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__
]);
([__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2d$connection$2f$service$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__);
;
const subscriptionService = {
    // Get current user's subscription
    getCurrentSubscription: async ()=>{
        console.log('Fetching current subscription...');
        // First check if we have the required data
        if ("TURBOPACK compile-time truthy", 1) {
            throw new Error('Cannot call subscription service on server-side rendering');
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
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2d$connection$2f$service$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["default"].get(`/api/subscriptions/${dbOrgId}`);
                console.log('Subscription API response:', response.status);
                return response.data;
            } else {
                // Fall back to Clerk ID if database ID is not available
                console.log('Using Clerk organization ID for API call:', orgId);
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2d$connection$2f$service$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["default"].get(`/api/subscriptions/${orgId}`);
                console.log('Subscription API response:', response.status);
                return response.data;
            }
        } catch (error) {
            console.error('Failed to get subscription by ID, falling back to current endpoint:', error);
            // Fall back to the current endpoint
            try {
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2d$connection$2f$service$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["default"].get('/api/subscriptions/current');
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
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2d$connection$2f$service$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["default"].post('/api/subscriptions/create-checkout', {
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
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2d$connection$2f$service$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["default"].put(`/api/subscriptions/${subscriptionId}/cancel`);
            return response.data;
        } catch (error) {
            console.error('Failed to cancel subscription:', error);
            throw error;
        }
    },
    // Get available subscription plans
    getSubscriptionPlans: async ()=>{
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2d$connection$2f$service$2e$ts__$5b$ssr$5d$__$28$ecmascript$29$__["default"].get('/api/subscriptions/plans');
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
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),

};

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__814e5e._.js.map