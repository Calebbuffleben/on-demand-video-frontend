'use client';

import { useState, useEffect } from 'react';
import { useOrganization, useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';

type OrganizationOverviewProps = {
  className?: string;
};

export default function OrganizationOverviewCard({ className = '' }: OrganizationOverviewProps) {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { user, isLoaded: userLoaded } = useUser();
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [creationDate, setCreationDate] = useState<string | null>(null);
  const orgMetrics = {
    totalVideos: '32',
    totalStorage: '1.8 GB',
    storageUsed: 45, // percentage
    videoUploads: [65, 42, 73, 50, 89, 78, 93]  // last 7 days trend
  };
  
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
      <div className={`bg-white rounded-lg shadow-sm p-6 animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }
  
  if (!organization) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <h2 className="text-lg font-semibold mb-2">No Organization Selected</h2>
        <p className="text-gray-600">Please select or create an organization to see details.</p>
      </div>
    );
  }
  
  // Generate a random color if no image is available
  const getRandomGradient = () => {
    const gradients = [
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-pink-600',
      'from-green-500 to-teal-600',
      'from-red-500 to-orange-600',
      'from-yellow-500 to-amber-600'
    ];
    
    return gradients[Math.floor(Math.random() * gradients.length)];
  };
  
  // Sparkline component for trends
  const Sparkline = ({ data, color = 'text-indigo-500' }: { data: number[], color?: string }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    const normalize = (val: number) => 100 - ((val - min) / range * 60 + 20); // keep within 20-80% height
    
    return (
      <svg className="w-full h-10" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={data.map((val, i) => `${i * (100 / (data.length - 1))},${normalize(val)}`).join(' ')}
          fill="none"
          stroke={color.replace('text-', 'stroke-')}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${color}`}
        />
      </svg>
    );
  };
  
  // Role badge component
  const RoleBadge = ({ role }: { role: string }) => {
    const getRoleColor = (role: string) => {
      switch (role.toLowerCase()) {
        case 'admin':
          return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'owner':
          return 'bg-indigo-100 text-indigo-800 border-indigo-200';
        case 'member':
        default:
          return 'bg-blue-100 text-blue-800 border-blue-200';
      }
    };
    
    return (
      <span className={`text-xs px-2.5 py-0.5 rounded-full border ${getRoleColor(role)}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      {/* Header with background */}
      <div className={`bg-gradient-to-r ${organization.imageUrl ? 'from-indigo-600 to-blue-700' : getRandomGradient()} p-6 text-white`}>
        <div className="flex items-center">
          {organization.imageUrl ? (
            <div className="w-16 h-16 bg-white rounded-lg overflow-hidden mr-4 flex-shrink-0 shadow-md border-2 border-white">
              <Image 
                src={organization.imageUrl} 
                alt={organization.name || 'Organization'} 
                width={64} 
                height={64}
                className="object-cover" 
              />
            </div>
          ) : (
            <div className="w-16 h-16 bg-white rounded-lg mr-4 flex-shrink-0 flex items-center justify-center text-indigo-700 font-bold text-2xl shadow-md border-2 border-white">
              {organization.name?.charAt(0) || '?'}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold">{organization.name}</h2>
            <div className="flex items-center mt-2">
              {userRole && <RoleBadge role={userRole} />}
              <span className="text-xs ml-2 text-indigo-100">Since {creationDate}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Organization details */}
      <div className="p-6">
        <div className="flex flex-wrap md:flex-nowrap gap-6">
          {/* Left column - Details */}
          <div className="w-full md:w-1/2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Organization Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Organization ID</label>
                <div className="flex items-center">
                  <span className="text-gray-900 font-mono text-sm truncate">{organization.id}</span>
                  <button 
                    className="ml-2 text-gray-400 hover:text-gray-600" 
                    onClick={() => navigator.clipboard.writeText(organization.id)}
                    title="Copy to clipboard"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">Created On</label>
                <div className="text-gray-900">{creationDate || 'Unknown'}</div>
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">Members</label>
                <div className="flex items-center">
                  <span className="text-gray-900 font-medium">{memberCount !== null ? memberCount : '—'}</span>
                  <Link href="/members" className="ml-2 text-xs text-indigo-600 hover:text-indigo-700">
                    View Members
                  </Link>
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">Your Role</label>
                <div className="text-gray-900">
                  {userRole ? <RoleBadge role={userRole} /> : 'Unknown'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Metrics */}
          <div className="w-full md:w-1/2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Storage & Usage</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Total Videos</div>
                  <div className="text-xl font-semibold text-gray-900">{orgMetrics.totalVideos}</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Storage Used</div>
                  <div className="text-xl font-semibold text-gray-900">{orgMetrics.totalStorage}</div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-gray-500">Storage Capacity</label>
                  <span className="text-xs font-medium text-gray-700">{orgMetrics.storageUsed}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${orgMetrics.storageUsed > 80 ? 'bg-red-500' : orgMetrics.storageUsed > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${orgMetrics.storageUsed}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-gray-500">Video Uploads (7 days)</label>
                  <span className="text-xs font-medium text-indigo-600">+12%</span>
                </div>
                <Sparkline data={orgMetrics.videoUploads} color="text-indigo-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer with actions */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          {memberCount !== null && memberCount > 0 ? `${memberCount} member${memberCount > 1 ? 's' : ''}` : ''}
        </div>
        <div className="flex space-x-3">
          <Link 
            href="/organization-settings" 
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            Settings
          </Link>
          <Link 
            href="/organization-profile" 
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            Manage Organization →
          </Link>
        </div>
      </div>
    </div>
  );
} 