export interface User {
  id: string;
  email: string;
  hashed_password?: string; // Optional for OAuth users
  created_at: Date;
  updated_at: Date;
  
  // OAuth fields
  google_id?: string;
  display_name?: string;
  profile_picture?: string;
  auth_provider: 'local' | 'google';
}

export interface GoogleUserProfile {
  id: string;
  email: string;
  displayName: string;
  photos?: Array<{ value: string }>;
}