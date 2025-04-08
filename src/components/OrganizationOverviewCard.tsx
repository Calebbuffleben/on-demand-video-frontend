'use client';

import { useState, useEffect } from 'react';
import { useOrganization, useUser } from '@clerk/nextjs';
import Image from 'next/image';

type OrganizationOverviewProps = {
  className?: string;
};

export default function OrganizationOverviewCard({ className = '' }: OrganizationOverviewProps) {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { user, isLoaded: userLoaded } = useUser();
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [creationDate, setCreationDate] = useState<string | null>(null);
  
  useEffect(() => {
    if (orgLoaded && organization) {
      // Format creation date
      const created = new Date(organization.createdAt);
      setCreationDate(created.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }));
      
      // Get member count if available
      if (organization.membersCount !== undefined) {
        setMemberCount(organization.membersCount);
      }
    }
  }, [orgLoaded, organization]);
  
  useEffect(() => {
    if (userLoaded && user && orgLoaded && organization) {
      // Find user's role in this organization
      const membership = user.organizationMemberships?.find(
        m => m.organization.id === organization.id
      );
      
      if (membership) {
        setUserRole(membership.role);
      }
    }
  }, [userLoaded, user, orgLoaded, organization]);
  
  if (!orgLoaded) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }
  
  if (!organization) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h2 className="text-lg font-semibold mb-2">No Organization Selected</h2>
        <p className="text-gray-600">Please select or create an organization to see details.</p>
      </div>
    );
  }
  
  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      {/* Header with background */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <div className="flex items-center">
          {organization.imageUrl ? (
            <div className="w-16 h-16 bg-white rounded-lg overflow-hidden mr-4 flex-shrink-0">
              <Image 
                src={organization.imageUrl} 
                alt={organization.name || 'Organization'} 
                width={64} 
                height={64}
                className="object-cover" 
              />
            </div>
          ) : (
            <div className="w-16 h-16 bg-white rounded-lg mr-4 flex-shrink-0 flex items-center justify-center text-blue-700 font-bold text-xl">
              {organization.name?.charAt(0) || '?'}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold">{organization.name}</h2>
            {userRole && (
              <span className="inline-block bg-blue-800 bg-opacity-50 text-white text-xs px-2 py-1 rounded mt-1">
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Organization details */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Organization ID</h3>
            <p className="text-gray-900 mb-4 font-mono text-sm">{organization.id}</p>
            
            <h3 className="text-sm font-medium text-gray-500">Created On</h3>
            <p className="text-gray-900 mb-4">{creationDate || 'Unknown'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Members</h3>
            <p className="text-gray-900 mb-4">{memberCount !== null ? memberCount : '—'}</p>
            
            <h3 className="text-sm font-medium text-gray-500">Your Role</h3>
            <p className="text-gray-900 mb-4">{userRole || 'Unknown'}</p>
          </div>
        </div>
      </div>
      
      {/* Footer with actions */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 flex justify-end">
        <a 
          href={`/organization-profile`} 
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Manage Organization →
        </a>
      </div>
    </div>
  );
} 