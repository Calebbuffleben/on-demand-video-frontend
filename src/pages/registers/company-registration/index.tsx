import { CreateOrganization, OrganizationList, useOrganizationList, UserButton, useUser } from "@clerk/nextjs";

const CompanyRegistrationPage = () => {
   
    return (
        <div>
          <h2>Clerk Test</h2>
          <UserButton />
        </div>
      );
}

export default CompanyRegistrationPage;