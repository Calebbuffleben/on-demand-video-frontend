import { OrganizationList } from "@clerk/nextjs";

export default function OrganizationSelectorPage() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Select an Organization</h1>
        <OrganizationList 
          hidePersonal
          afterSelectOrganizationUrl="/{organizationId}/dashboard"
          afterCreateOrganizationUrl="/{organizationId}/dashboard"
        />
      </div>
    </div>
  );
} 