(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/src_api-connection_subscriptions_ts_2451b9._.js", {

"[project]/src/api-connection/subscriptions.ts [client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
/**
 * Mock subscription service implementation
 * 
 * This is a temporary mock implementation of the subscription service
 * that returns static data instead of making API calls. This is used
 * until the backend API is fully implemented.
 */ // Static implementation with predetermined return values
__turbopack_esm__({
    "default": (()=>__TURBOPACK__default__export__)
});
const subscriptionService = {
    // Get current user's subscription - always returns a default response
    getCurrentSubscription () {
        return Promise.resolve({
            status: 'no_subscription',
            subscription: null,
            message: 'Subscription API not available yet'
        });
    },
    // Create a checkout session - simulates a successful checkout creation
    createCheckoutSession () {
        return Promise.resolve({
            sessionId: 'mock-session-id',
            sessionUrl: 'https://example.com/checkout/mock-session'
        });
    },
    // Get organizations for the current user - returns an empty array
    getOrganizations () {
        return Promise.resolve({
            organizations: []
        });
    },
    // Cancel subscription - simulates a successful cancellation
    cancelSubscription () {
        return Promise.resolve({
            success: true,
            message: 'Subscription cancelled successfully (mock)'
        });
    }
};
const __TURBOPACK__default__export__ = subscriptionService;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_api-connection_subscriptions_ts_2451b9._.js.map