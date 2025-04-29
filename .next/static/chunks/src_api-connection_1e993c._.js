(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/src_api-connection_1e993c._.js", {

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
    baseURL: ("TURBOPACK compile-time value", "http://localhost:3000") || 'http://localhost:4000/api',
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
        try {
            // First check if we're on server side
            if ("TURBOPACK compile-time falsy", 0) {
                "TURBOPACK unreachable";
            }
            // Avoid API calls for now since they're causing errors
            // Just return a default response
            return {
                status: 'no_subscription',
                subscription: null,
                message: 'Subscription API not available yet'
            };
        } catch (error) {
            // Catch any unexpected errors
            console.error('Unexpected error in subscription service:', error);
            return {
                status: 'error',
                subscription: null,
                message: 'An unexpected error occurred'
            };
        }
    },
    // Create a checkout session
    createCheckoutSession: async (priceId)=>{
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2d$connection$2f$service$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["default"].post('/subscriptions/create-checkout', {
                priceId
            });
            return response.data;
        } catch (error) {
            console.error('Failed to create checkout session:', error);
            // If endpoint doesn't exist, provide helpful message
            if (error.response?.status === 404) {
                throw new Error('Checkout endpoint not found. The subscription API may not be fully implemented yet.');
            }
            throw error;
        }
    },
    // Get organizations for the current user
    getOrganizations: async ()=>{
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2d$connection$2f$service$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["default"].get('/subscriptions/organizations');
            return response.data;
        } catch (error) {
            console.error('Failed to get organizations:', error);
            // If endpoint doesn't exist, return empty array
            if (error.response?.status === 404) {
                console.log('Organizations endpoint not found, returning empty list');
                return {
                    organizations: []
                };
            }
            throw error;
        }
    },
    // Cancel subscription - implementing as a placeholder for when it's added to the backend
    cancelSubscription: async (subscriptionId)=>{
        try {
            // This is a placeholder - the endpoint doesn't exist yet
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2d$connection$2f$service$2e$ts__$5b$client$5d$__$28$ecmascript$29$__["default"].put(`/subscriptions/${subscriptionId}/cancel`);
            return response.data;
        } catch (error) {
            console.error('Failed to cancel subscription:', error);
            // If endpoint doesn't exist, provide helpful message
            if (error.response?.status === 404) {
                throw new Error('Subscription cancellation is not implemented in the API yet.');
            }
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
}]);

//# sourceMappingURL=src_api-connection_1e993c._.js.map