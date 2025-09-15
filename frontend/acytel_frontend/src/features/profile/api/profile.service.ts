import api from '../../../shared/api';

// Keep the existing UserProfile interface for the frontend
export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  profilePicture?: string;
  authProvider: 'local' | 'google';
  createdAt?: string;
  updatedAt?: string;
}

// Add an interface for the raw data from the backend
export interface RawUserProfile {
  id: string;
  email: string;
  display_name?: string;
  profile_picture?: string;
  auth_provider: 'local' | 'google';
  created_at?: string;
  updated_at?: string;
}

// This is the data sent TO the backend, which uses snake_case
export interface UpdateProfileData {
  display_name?: string;
  email?: string;
}

// Mapper function to convert from backend format to frontend format
function mapProfile(raw: RawUserProfile): UserProfile {
  return {
    id: raw.id,
    email: raw.email,
    displayName: raw.display_name,
    profilePicture: raw.profile_picture,
    authProvider: raw.auth_provider,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export async function getUserProfile(): Promise<UserProfile> {
  try {
    // Tell axios what kind of raw data to expect
    const response = await api.get<RawUserProfile>('/users/profile');
    // Map the raw data to the frontend's expected format
    return mapProfile(response.data);
  } catch (error) {
    console.error('Get profile failed:', error);
    throw error;
  }
}

export async function updateUserProfile(data: UpdateProfileData): Promise<UserProfile> {
  try {
    // Tell axios what kind of raw data to expect in the response
    const response = await api.put<RawUserProfile>('/users/profile', data);
    // Map the raw response data to the frontend's expected format
    return mapProfile(response.data);
  } catch (error) {
    console.error('Update profile failed:', error);
    throw error;
  }
}

export async function deleteUserAccount(): Promise<void> {
  try {
    await api.delete('/users/account');
  } catch (error) {
    console.error('Delete account failed:', error);
    throw error;
  }
}