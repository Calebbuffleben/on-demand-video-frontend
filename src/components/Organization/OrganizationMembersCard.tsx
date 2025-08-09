'use client';

import { useState, useEffect } from 'react';
import api from '@/api-connection/service';
import { useOrganization } from '@/hooks/useOrganization';
import Image from 'next/image';
import Link from 'next/link';

type OrganizationMembersCardProps = {
  className?: string;
  maxDisplayed?: number;
};

interface Member {
  id: string;
  role: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  email?: string;
  createdAt: Date;
}

export default function OrganizationMembersCard({ 
  className = '', 
  maxDisplayed = 5 
}: OrganizationMembersCardProps) {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchMembers() {
      if (!orgLoaded || !organization) {
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const orgId = organization.id;
        const res = await api.get(`/subscriptions/members/${orgId}`);
        if (res.data && Array.isArray(res.data)) {
          setMembers(res.data as Member[]);
        } else if (res.data?.members && Array.isArray(res.data.members)) {
          setMembers(res.data.members as Member[]);
        } else {
          setMembers([]);
        }
      } catch (err) {
        console.error('Error fetching organization members:', err);
        setError('Failed to load members');
      } finally {
        setLoading(false);
      }
    }
    
    fetchMembers();
  }, [orgLoaded, organization]);
  
  if (!orgLoaded || loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center mb-3">
            <div className="h-10 w-10 bg-gray-200 rounded-full mr-3"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h2 className="text-lg font-semibold mb-2">Organization Members</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  
  // Count roles
  const roleCount = members.reduce((acc, member) => {
    acc[member.role] = (acc[member.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Organization Members</h2>
          <span className="text-sm text-gray-500">
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </span>
        </div>
        
        {/* Role summary */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(roleCount).map(([role, count]) => (
            <span 
              key={role} 
              className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700"
            >
              {role}: {count}
            </span>
          ))}
        </div>
        
        {/* Members list */}
        <div className="space-y-3">
          {members.slice(0, maxDisplayed).map(member => (
            <div key={member.id} className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-silver-200 overflow-hidden mr-3 flex-shrink-0">
                {member.imageUrl ? (
                  <Image 
                    src={member.imageUrl} 
                    alt={`${member.firstName || ''} ${member.lastName || ''}`}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-scale-700 text-white text-sm font-bold">
                    {member.firstName?.[0] || member.email?.[0] || '?'}
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-sm">
                  {member.firstName && member.lastName 
                    ? `${member.firstName} ${member.lastName}`
                    : member.email || 'Unknown member'}
                  <span className="ml-2 text-xs text-silver-500 font-normal capitalize">
                    {member.role}
                  </span>
                </p>
                {member.email && (
                  <p className="text-xs text-silver-500">{member.email}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Show more link if needed */}
        {members.length > maxDisplayed && (
          <div className="mt-4 pt-4 border-t border-silver-100 text-center">
            <Link 
              href="/organization-profile" 
              className="text-scale-600 hover:text-scale-800 text-sm font-medium"
            >
              View all {members.length} members
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 