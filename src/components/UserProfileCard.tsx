'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';

export default function UserProfileCard() {
  const { user, isLoaded } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  
  if (!isLoaded) {
    return (
      <div className="bg-white rounded-lg shadow p-8 animate-pulse">
        <div className="h-24 w-24 rounded-full bg-gray-200 mx-auto mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <p className="text-center text-gray-500">Please sign in to view your profile</p>
      </div>
    );
  }

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = () => {
    // Here you would implement the logic to save user profile changes
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header with cover image */}
      <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
      
      {/* Profile content */}
      <div className="px-6 py-4 relative">
        {/* Avatar */}
        <div className="absolute -top-16 left-6">
          <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white bg-white">
            {user.imageUrl ? (
              <Image 
                src={user.imageUrl} 
                alt={user.fullName || 'User'} 
                width={96} 
                height={96}
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
        </div>
        
        {/* Edit button */}
        <div className="flex justify-end mb-8">
          <button
            onClick={handleEditToggle}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
        
        {/* User info */}
        <div className="mt-4">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue={user.fullName || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  defaultValue={user.username || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  defaultValue=""
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold">{user.fullName || 'No name provided'}</h2>
              <p className="text-gray-600">@{user.username || 'username'}</p>
              
              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1">{user.primaryEmailAddress?.emailAddress || 'No email provided'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Member since</h3>
                  <p className="mt-1">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
     
    </div>
  );
} 