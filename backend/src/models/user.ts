/**
 * Represents the data structure for a User, mirroring the 'users' table
 * in the ScyllaDB database. This interface ensures type safety across the
 * application when handling user objects.
 */
export interface User {
  id: string; // Stored as UUID in the database
  email: string;
  hashed_password: string;
  created_at: Date;
  updated_at: Date;
}