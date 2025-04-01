import { CreateOrganization } from "@clerk/nextjs";

export default function CreateOrganizationPage() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '20px'
    }}>
      <CreateOrganization 
        afterCreateOrganizationUrl="/{organizationId}/dashboard"
      />
    </div>
  );
} 