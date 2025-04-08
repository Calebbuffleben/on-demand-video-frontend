# On demand videos

A multi-tenant product management system built with Next.js, Clerk, and Prisma.

## Features

### Multi-tenancy
- Organization-based data isolation
- Secure tenant routing
- Automatic organization context handling
- Organization-specific product management

### Authentication & Authorization
- Secure user authentication via Clerk
- Organization membership management
- Role-based access control
- Protected API routes

### User Profile & Settings
- Customizable user profiles with avatar support
- Personal information management
- Account settings with dark mode toggle
- Secure sign-out functionality

### Dashboard Interface
- Contextual navigation menu
- User profile access from any page
- Organization-specific dashboards
- Responsive design for all device sizes

### Product Management
- Create, read, update, and delete products
- Organization-specific product catalogs
- SKU management (unique within organizations)
- Inventory tracking

## Tech Stack

- **Frontend**: Next.js 15.1.4
- **Authentication**: Clerk
- **Database**: PostgreSQL
- **ORM**: Prisma 6.3.1
- **Styling**: Tailwind CSS 3.4.1
- **Type Safety**: TypeScript

## Project Structure

```
src/
├── api-connection/    # API client setup
├── components/        # React components
│   ├── ui/            # UI components
│   └── DashboardMenu.tsx  # Application navigation menu
├── contexts/         # React contexts
├── hooks/           # Custom hooks
├── interfaces/      # TypeScript interfaces
├── pages/          # Next.js pages
│   ├── profile/    # User profile pages
│   └── [tenantId]/ # Tenant-specific routes
├── server/         # Server-side logic
│   ├── database/   # Database operations
│   └── services/   # Business logic
├── styles/         # CSS styles
└── types/         # TypeScript types
```

## Database Schema

```prisma
model Organization {
  id          String    @id
  name        String
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Product {
  id              String       @id @default(uuid())
  name            String
  sku             String
  price           String
  quantity        Int
  description     String
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@unique([sku, organizationId])
  @@index([organizationId])
}
```

## Setup & Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd natural-products
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

## Multi-tenant Implementation

### Middleware
The application uses Clerk middleware to handle organization context:

```typescript
import { NextResponse } from "next/server";
import { clerkMiddleware, getAuth } from "@clerk/nextjs/server";

export default clerkMiddleware(async (_, event) => {
  const { userId, orgId } = await getAuth(event);

  // Organization routing and context handling
  const pathOrgId = event.nextUrl.pathname.split('/').find((segment: string) => 
    segment.startsWith('org_')
  );

  // ... organization context logic
});
```

### API Routes
All API routes are organization-aware:

```typescript
// Example API route
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const organizationId = req.headers['x-organization-id'] as string;
  
  if (!organizationId) {
    return res.status(400).json({ message: "Organization ID is required" });
  }

  // Organization-specific logic
}
```

### Data Access
Products are automatically scoped to organizations:

```typescript
// Example repository method
async findAll(organizationId: string) {
  return await prisma.product.findMany({
    where: { organizationId }
  });
}
```

## URL Structure

- `/` - Home page
- `/sign-in` - Authentication
- `/create-organization` - Organization creation
- `/profile` - User profile (non-tenant specific)
- `/{tenant_id}/dashboard` - Organization dashboard
- `/{tenant_id}/profile` - User profile (tenant context)
- `/{tenant_id}/products` - Product management
- `/{tenant_id}/products/{product_id}` - Product details
- `/{tenant_id}/members` - Member management (admin only)
- `/{tenant_id}/billing` - Billing management (admin only)
- `/{tenant_id}/danger-zone` - Dangerous operations (owner only)

## Security Features

1. **Data Isolation**
   - Each organization's data is completely isolated
   - Cross-organization access is prevented
   - SKUs are unique within organizations

2. **Authentication**
   - JWT-based authentication
   - Secure session management
   - Protected API routes

3. **Authorization**
   - Organization membership verification
   - Role-based access control
   - API route protection

## Development Guidelines

1. **Adding New Features**
   - Always include organization context
   - Use the `useOrganization` hook for UI
   - Add proper type definitions

2. **API Development**
   - Always validate organization context
   - Include error handling
   - Follow RESTful conventions

3. **Database Operations**
   - Always include organization filtering
   - Use transactions when necessary
   - Follow Prisma best practices

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Your License]

## Middleware Documentation

The application uses a sophisticated middleware system to handle authentication, authorization, and organization access control.

### Route Protection

#### Public Routes
```typescript
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/public/(.*)'
]);
```
These routes are accessible without authentication. They include:
- Homepage
- Authentication pages
- Public API endpoints

#### Organization Routes
```typescript
const isOrgRoute = createRouteMatcher([
  '/org/(.*)/dashboard',
  '/org/(.*)/products',
  '/org/(.*)/settings'
]);
```
Basic organization routes requiring member access:
- Organization dashboard
- Product management
- Basic settings

#### Admin Routes
```typescript
const isOrgAdminRoute = createRouteMatcher([
  '/org/(.*)/members',
  '/org/(.*)/billing',
  '/org/(.*)/settings/advanced'
]);
```
Routes requiring administrative privileges:
- Member management
- Billing operations
- Advanced settings

#### Owner Routes
```typescript
const isOrgOwnerRoute = createRouteMatcher([
  '/org/(.*)/danger-zone',
  '/org/(.*)/delete'
]);
```
Routes restricted to organization owners:
- Dangerous operations
- Organization deletion

### Access Control Flow

1. **Public Access Check**
   ```typescript
   if (isPublicRoute(req)) {
     return NextResponse.next();
   }
   ```
   - Allows unrestricted access to public routes
   - No authentication required

2. **Organization Context**
   ```typescript
   const orgId = req.nextUrl.pathname.split('/').find(segment => 
     segment.startsWith('org_')
   );
   ```
   - Extracts organization ID from URL
   - Used for context and access control

3. **Member Access**
   ```typescript
   if (isOrgRoute(req)) {
     await auth.protect();
     // ... organization context handling
   }
   ```
   - Requires basic authentication
   - Sets organization context in headers
   - Enables organization-specific data access

4. **Admin Access**
   ```typescript
   if (isOrgAdminRoute(req)) {
     await auth.protect((has) => {
       return has({ permission: 'org:admin' }) || 
              has({ permission: 'org:owner' });
     });
   }
   ```
   - Requires admin or owner permissions
   - Enables access to administrative functions

5. **Owner Access**
   ```typescript
   if (isOrgOwnerRoute(req)) {
     await auth.protect((has) => has({ permission: 'org:owner' }));
   }
   ```
   - Strictest permission level
   - Required for critical operations

6. **Organization Selection**
   ```typescript
   if (!orgId && !isPublicRoute(req)) {
     await auth.protect();
     return NextResponse.redirect(new URL('/organization-selector', req.url));
   }
   ```
   - Redirects authenticated users without an organization context
   - Ensures proper organization selection

### Organization Context Headers

When accessing organization routes, the middleware adds organization context:
```typescript
const requestHeaders = new Headers(req.headers);
requestHeaders.set('x-organization-id', orgId.replace('org_', ''));
```

This enables:
- Organization-specific data filtering
- Proper multi-tenant isolation
- Context-aware API responses

### URL Pattern Matching

```typescript
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```
The middleware applies to:
- All application routes
- API routes
- Excludes static files and Next.js internals

### Permission Levels

1. **Public**
   - No authentication required
   - Access to public pages and resources

2. **Member**
   - Basic authentication required
   - Access to organization-specific content
   - View and interact with products

3. **Admin**
   - Enhanced permissions
   - Member management
   - Billing access
   - Advanced settings

4. **Owner**
   - Highest permission level
   - Critical organization operations
   - Complete administrative control

### Best Practices

1. **Route Organization**
   - Keep routes organized by permission level
   - Use clear naming conventions
   - Maintain consistent URL structure

2. **Permission Checks**
   - Always check permissions before access
   - Use the most restrictive permission necessary
   - Combine permissions logically when needed

3. **Organization Context**
   - Always include organization context in headers
   - Validate organization access
   - Maintain proper isolation between organizations

4. **Error Handling**
   - Redirect unauthorized users appropriately
   - Maintain security during errors
   - Provide clear user feedback

### Security Considerations

1. **Authentication**
   - All non-public routes require authentication
   - Uses Clerk's secure authentication system
   - Proper session management

2. **Authorization**
   - Role-based access control
   - Granular permission system
   - Proper permission validation

3. **Data Isolation**
   - Organization-specific data access
   - Proper header management
   - Secure context handling

4. **URL Security**
   - Proper route matching
   - Protected sensitive routes
   - Secure parameter handling

## User and Organization Flow

### Registration and Authentication Flow

1. **User Registration**
   - New users sign up at `/sign-up`
   - Clerk handles the registration process
   - Required information:
     - Email address
     - Password
     - Name
   - Email verification is required
   - After verification, users are redirected to the organization creation/selection page

2. **User Authentication**
   - Existing users sign in at `/sign-in`
   - Clerk manages authentication
   - Support for:
     - Email/password
     - Social logins (Google, GitHub)
     - Multi-factor authentication (optional)
   - Upon successful login, users are redirected to:
     - Their organization if they belong to one
     - Organization selector if they belong to multiple organizations
     - Organization creation if they don't belong to any

3. **Organization Creation**
   - New organizations are created at `/create-organization`
   - Required information:
     - Organization name
     - Organization slug (auto-generated, editable)
   - The creator automatically becomes the organization owner
   - After creation, users are redirected to the organization dashboard

4. **Organization Invitation**
   - Organization admins/owners can invite users at `/org/{org_id}/members/invite`
   - Invitation process:
     - Enter email address
     - Select role (Member, Admin, Owner)
     - Send invitation
   - Invited users receive an email with a link to join
   - New users are prompted to create an account
   - Existing users are added to the organization directly

### Role and Permission Management

1. **Default Roles**
   - **Owner**: Full control, can delete organization
   - **Admin**: Can manage members and settings
   - **Member**: Basic access to organization resources

2. **Permission Assignment**
   - Roles are assigned during:
     - Organization creation (creator becomes Owner)
     - User invitation (specified by inviter)
     - Role management (by Admins/Owners)

3. **Role Management**
   - Organization admins/owners can manage roles at `/org/{org_id}/members`
   - Available actions:
     - Promote members to Admin
     - Demote admins to Member
     - Transfer ownership (Owners only)
     - Remove members

### Organization Switching

1. **Organization Selector**
   - Available at `/organization-selector`
   - Lists all organizations the user belongs to
   - Shows the user's role in each organization
   - Allows creating a new organization

2. **Active Organization Context**
   - The active organization is determined by the URL path
   - Organization context is maintained in:
     - URL path (`/{tenant_id}/...`)
     - Request headers (`x-organization-id`)
     - Client-side context

3. **Organization Switching Process**
   - User selects an organization from the selector
   - User is redirected to that organization's dashboard
   - All subsequent requests include the organization context
   - Data is filtered based on the active organization

### Data Access Flow

1. **Initial Data Load**
   - When accessing an organization page:
     - Middleware validates organization access
     - Organization ID is added to request headers
     - API requests include organization context

2. **API Request Flow**
   - Client makes request to API endpoint
   - Middleware adds organization context
   - API controller extracts organization ID
   - Database queries filter by organization ID
   - Response includes only organization-specific data

3. **Data Modification Flow**
   - User submits form/makes change
   - Request includes organization context
   - Server validates organization access
   - Data is saved with organization association
   - Response confirms successful operation

### Organization Lifecycle

1. **Creation Phase**
   - Organization is created
   - Initial owner is assigned
   - Default settings are established

2. **Growth Phase**
   - Members are invited
   - Products are added
   - Settings are customized

3. **Maintenance Phase**
   - Member roles are adjusted
   - Products are updated
   - Settings are refined

4. **Termination Phase**
   - Organization deletion is initiated by owner
   - Confirmation is required
   - All associated data is removed

### Implementation Examples

#### User Registration Component
```typescript
import { SignUp } from "@clerk/nextjs";

const SignUpPage = () => (
  <div className="auth-container">
    <h1>Create an Account</h1>
    <SignUp 
      path="/sign-up"
      routing="path"
      signInUrl="/sign-in"
      redirectUrl="/organization-selector"
    />
  </div>
);

export default SignUpPage;
```

#### Organization Creation Component
```typescript
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useClerk } from "@clerk/nextjs";

const CreateOrganizationPage = () => {
  const { register, handleSubmit } = useForm();
  const router = useRouter();
  const { createOrganization } = useClerk();
  
  const onSubmit = async (data) => {
    try {
      const organization = await createOrganization({ name: data.name });
      router.push(`/${organization.id}/dashboard`);
    } catch (error) {
      console.error("Failed to create organization", error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Create Organization</h1>
      <input {...register("name", { required: true })} placeholder="Organization Name" />
      <button type="submit">Create</button>
    </form>
  );
};

export default CreateOrganizationPage;
```

#### Organization Selector Component
```typescript
import { useOrganizationList } from "@clerk/nextjs";
import { useRouter } from "next/router";

const OrganizationSelector = () => {
  const { organizationList, isLoaded } = useOrganizationList();
  const router = useRouter();
  
  if (!isLoaded) return <div>Loading...</div>;
  
  const switchOrganization = (orgId) => {
    router.push(`/${orgId}/dashboard`);
  };
  
  return (
    <div>
      <h1>Your Organizations</h1>
      <ul>
        {organizationList.map((org) => (
          <li key={org.organization.id}>
            <button onClick={() => switchOrganization(org.organization.id)}>
              {org.organization.name}
            </button>
            <span>Role: {org.role}</span>
          </li>
        ))}
      </ul>
      <a href="/create-organization">Create New Organization</a>
    </div>
  );
};

export default OrganizationSelector;
```

# Stripe Integration

The application integrates with Stripe for subscription management and billing. Here's an overview of the subscription flow:

1. **Pricing Plans**: The available subscription plans are defined in the `src/pages/pricing/index.tsx` file. Each plan specifies a name, price, description, features, and a Stripe Price ID.

2. **Checkout**: When a user clicks the "Subscribe" button on the pricing page, the `Checkout` component (`src/components/Checkout/Checkout.tsx`) is triggered. This component sends a request to the `/api/subscriptions/create-subscription` endpoint with the selected plan's Price ID.

3. **Subscription Creation**: The `/api/subscriptions/create-subscription` API route (`src/pages/api/subscriptions/create-subscription.ts`) receives the Price ID and creates a new Stripe Checkout Session. It returns the Session URL to the client.

4. **Redirection**: The `Checkout` component redirects the user to the Stripe Checkout page using the Session URL received from the server. The user completes the payment process on the Stripe-hosted page.

5. **Webhooks**: After a successful payment, Stripe sends a webhook to the application. The webhook handler (not shown in the provided code) should be implemented to update the user's subscription status in the database.

6. **Access Control**: The application should use middleware to check the user's subscription status and enable/disable access to features based on their plan.

Note: Make sure to set up the required Stripe API keys and configure the webhook endpoint in your production environment.

For more information on integrating Stripe subscriptions, refer to the [Stripe Docs](https://stripe.com/docs/billing/subscriptions/build-subscription?ui=checkout).

# Frontend Authentication & API Service

This document outlines the setup for handling authentication using Clerk and interacting with the backend API in this Next.js frontend application.

## Overview

The frontend integrates with a NestJS backend that uses Clerk for authentication. The core components responsible for managing API calls and authentication tokens are:

1.  **API Service (`src/api-connection/service.ts`):** An Axios instance configured with interceptors to automatically handle authentication tokens and basic error responses.
2.  **API Hook (`src/hooks/useApi.ts`):** A React custom hook designed to simplify making authenticated API requests from components, providing loading and error states.

## API Service (`src/api-connection/service.ts`)

This file configures and exports a singleton Axios instance (`api`) used for all backend communication.

### Key Features:

*   **Base URL:** Configured using the `NEXT_PUBLIC_API_URL` environment variable (defaults to `http://localhost:4000`).
*   **Request Interceptor:**
    *   Automatically runs before each request sent via the `api` instance.
    *   Retrieves the JWT token currently stored in `localStorage` (under the key `'token'`).
    *   If a token is found, it attaches it to the `Authorization` header as a Bearer token (`Authorization: Bearer <token>`).
*   **Response Interceptor:**
    *   Automatically runs after receiving a response (or error) from the backend.
    *   Checks if the response status is `401 Unauthorized`.
    *   If a `401` occurs, it dispatches a global browser event `new CustomEvent('auth:unauthorized')`. This signals to other parts of the application (e.g., a global context or layout) that the user's session might be invalid or expired, allowing for appropriate action like redirecting to the login page.

## API Hook (`src/hooks/useApi.ts`)

This custom React hook (`useApi`) provides a convenient way to make authenticated API calls from within your functional components.

### Key Features:

*   **Clerk Integration:** Uses Clerk's `useClerk()` hook to access the current user `session`.
*   **Token Management (`ensureAuthToken`):**
    *   Before each API request (`get`, `post`, etc.) is made, this internal function is called.
    *   It uses `session.getToken()` to retrieve the latest valid JWT from Clerk (Clerk handles refreshing expired tokens automatically).
    *   It stores the retrieved token in `localStorage` (key: `'token'`) so the API service's request interceptor can access it.
    *   If getting the token fails, it dispatches the `auth:unauthorized` event.
*   **Request Methods:** Provides standard HTTP request methods (`get`, `post`, `put`, `delete`). Each method handles:
    *   Setting loading and error states.
    *   Calling `ensureAuthToken`.
    *   Making the API call using the `api` service instance.
    *   Handling errors and updating the error state.
*   **State Management:** Returns state variables for easy UI integration:
    *   `loading` (boolean): Indicates if a request initiated by the hook is currently in progress.
    *   `error` (Error | null): Holds any error object caught during the API request.

### Usage Example:

```tsx
import React, { useEffect, useState } from 'react';
import useApi from '../hooks/useApi'; // Adjust path as needed

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

function UserProfileComponent() {
  const { get, loading, error } = useApi();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const data = await get<UserProfile>('/users/profile'); // Example endpoint
      if (data) {
        setProfile(data);
      }
    };
    fetchProfile();
  }, [get]);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className="error">Error loading profile: {error.message}</p>;
  if (!profile) return <p>No profile data found.</p>;

  return (
    <div>
      <h1>{profile.name}</h1>
      <p>Email: {profile.email}</p>
    </div>
  );
}

export default UserProfileComponent;
```

## Authentication Flow Summary

1.  A component calls one of the methods from the `useApi` hook (e.g., `get('/data')`).
2.  The specific hook method (`get`, `post`, etc.) sets loading state, resets error state, and calls `ensureAuthToken`.
3.  `ensureAuthToken` gets the latest token from Clerk via `session.getToken()` and stores it in `localStorage`.
4.  The hook method then uses the `api` instance from `service.ts` to make the actual HTTP request (e.g., `api.get('/data')`).
5.  The request interceptor in `service.ts` reads the token from `localStorage` and adds the `Authorization: Bearer <token>` header.
6.  The request is sent to the backend.
7.  If the backend responds with `401 Unauthorized`, the response interceptor in `service.ts` catches it and dispatches the `auth:unauthorized` event.
8.  The `useApi` hook method catches any errors, updates its `loading` and `error` states, and returns the result or null.

## Handling 401 Errors / Session Expiry

The application should listen for the `auth:unauthorized` event dispatched by the API service's response interceptor. This is typically done in a layout component or a dedicated context provider.

**Example Listener (e.g., in `_app.tsx` or a layout component):**

```tsx
import { useEffect } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/router';

function AppLayout({ children }) {
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    const handleUnauthorized = () => {
      console.warn('Unauthorized request detected. Signing out and redirecting to login.');
      // Optionally sign out the Clerk session
      signOut(() => router.push('/sign-in')); 
      // Or just redirect
      // router.push('/sign-in');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [signOut, router]);

  return <>{children}</>;
}
```

## Authentication

The application uses Clerk for secure user authentication and session management. The `useClerkToken` hook is used to store the Clerk JWT in localStorage for use in authenticated API requests.

### Using the useClerkToken Hook

The `useClerkToken` hook automatically retrieves the Clerk JWT and stores it in localStorage whenever the user session changes. It also sets up a polling interval to periodically check for token updates.

To use the hook, simply import it in your component:

```typescript
import { useClerkToken } from '@/hooks/useClerkToken';

function MyComponent() {
  useClerkToken();
  // ...
}
```

The hook will handle token management behind the scenes, making the token available to the API service for authenticated requests.

### Configuring Clerk JWT Templates

By default, the `useClerkToken` hook retrieves the standard Clerk JWT with no additional claims. If your application requires specific claims or permissions in the token, you can configure a custom JWT template in your Clerk dashboard.

To use a custom template, update the `getToken` call in the hook:

```typescript
const token = await session.getToken({
  template: 'my_custom_template'
});
```

## User Interface Components

### DashboardMenu

The application includes a universal dashboard menu component that provides navigation and user functionality:

```typescript
import DashboardMenu from '@/components/DashboardMenu';

// Usage in layout or page components
<DashboardMenu />
```

Key features:
- User avatar display with dropdown menu
- Context-aware navigation to profile pages
- Settings access
- Secure sign-out functionality
- Responsive design (mobile and desktop)

### UserProfileCard

Display and edit user information:

```typescript
import UserProfileCard from '@/components/UserProfileCard';

// Usage in profile pages
<UserProfileCard />
```

Features:
- Display user avatar, name, email and creation date
- Edit mode for updating profile information
- Loading states and error handling

### UserSettingsCard

Manage user preferences and account settings:

```typescript
import UserSettingsCard from '@/components/UserSettingsCard';

// Usage in profile or settings pages
<UserSettingsCard />
```

Features:
- Dark mode toggle
- Email notification preferences
- Security settings access
- Sign-out functionality with confirmation

## Profile Pages

The application includes profile pages in both tenant and non-tenant contexts:

### Global Profile

Access your profile without organization context:
- URL: `/profile`
- Shows your Clerk user information
- Edit personal details
- Manage account settings

### Tenant-specific Profile

Access your profile within an organization:
- URL: `/{tenant_id}/profile`
- Shows your user information in organization context
- Organization-specific settings and permissions
- Tenant-aware navigation



