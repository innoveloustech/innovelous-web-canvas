// import React, { createContext, useContext, useState, useEffect } from 'react';

// interface AuthContextType {
//   isAuthenticated: boolean;
//   login: (password: string) => boolean;
//   logout: () => void;
//   changePassword: (currentPassword: string, newPassword: string) => boolean;
//   getCurrentPassword: () => string;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   // Default password - will be overridden if user has set a custom one
//   const DEFAULT_PASSWORD = 'innovelous2024';

//   useEffect(() => {
//     const authStatus = localStorage.getItem('admin_authenticated');
//     if (authStatus === 'true') {
//       setIsAuthenticated(true);
//     }
//   }, []);

//   const getCurrentPassword = (): string => {
//     return localStorage.getItem('admin_password') || DEFAULT_PASSWORD;
//   };

//   const login = (password: string) => {
//     const currentPassword = getCurrentPassword();
    
//     if (password === currentPassword) {
//       setIsAuthenticated(true);
//       localStorage.setItem('admin_authenticated', 'true');
//       return true;
//     }
//     return false;
//   };

//   const logout = () => {
//     setIsAuthenticated(false);
//     localStorage.removeItem('admin_authenticated');
//   };

//   const changePassword = (currentPassword: string, newPassword: string): boolean => {
//     const storedPassword = getCurrentPassword();
    
//     // Verify current password
//     if (currentPassword !== storedPassword) {
//       return false;
//     }

//     // Validate new password (basic validation)
//     if (!newPassword || newPassword.length < 6) {
//       return false;
//     }

//     // Save new password
//     localStorage.setItem('admin_password', newPassword);
//     return true;
//   };

//   return (
//     <AuthContext.Provider value={{ 
//       isAuthenticated, 
//       login, 
//       logout, 
//       changePassword, 
//       getCurrentPassword 
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// src/contexts/AuthContext.tsx

// src/contexts/AuthContext.tsx
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supbaseClient'; // Still need Supabase client for database operations
import bcrypt from 'bcryptjs'

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>; // Logout will now just clear client-side auth state
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  // getCurrentPassword might become less relevant for general use, but can be kept for initial setup logic
  getCurrentPassword: () => Promise<string>; // This will fetch the *current* plain-text password (for now)
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Constants for default admin credentials
  const INITIAL_ADMIN_EMAIL = 'admin@yourapp.com';
  const INITIAL_ADMIN_PASSWORD = 'innovelous2024'; // WARNING: This should be hashed in production!

  // Simulate authentication status check on mount
  useEffect(() => {
    // Check local storage for a simple authenticated flag
    const authStatus = localStorage.getItem('admin_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false); // Done checking initial status
  }, []);

  // Helper to get admin credentials from admin_settings
  // For production, this function would decrypt/verify the password hash.
  const getAdminCredentials = async (): Promise<{ email: string; password_hash: string } | null> => { // Changed 'password' to 'password_hash'
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_name', 'admin_credentials')
        .single();

      if (error && error.code === 'PGRST116') { // No rows found
        // If no credentials in DB, return initial defaults (NOTE: This plain password won't be compared with hash directly)
        // For a truly secure system, the *initial default* password should also be pre-hashed and stored securely.
        // Or, you'd only create the admin user via a secure setup process.
        return { email: INITIAL_ADMIN_EMAIL, password_hash: 'PLAIN_PASSWORD_AS_HASH_PLACEHOLDER' }; // Placeholder for hash
      } else if (error) {
        console.error('Error fetching admin credentials from DB:', error);
        return null;
      }
      // Assuming setting_value is JSONB and contains 'email' and 'password_hash'
      return data?.setting_value as { email: string; password_hash: string } || null;
    } catch (error) {
      console.error('Error in getAdminCredentials:', error);
      return null;
    }
  };


  // This function is still here for compatibility if needed elsewhere,
  // but its role shifts if email is also dynamic.
  // It will now specifically retrieve the 'password' field from the 'admin_credentials' JSONB object.
  const getCurrentPassword = async (): Promise<string> => {
      const credentials = await getAdminCredentials();
      return credentials ? credentials.password_hash : INITIAL_ADMIN_PASSWORD;
  };


  // Login function now ONLY checks against admin_settings table
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const storedCredentials = await getAdminCredentials();
      
      if (!storedCredentials) {
        console.error('Admin credentials not found in database or defaults.');
        return false;
      }
      
      
      const passwordMatch = await bcrypt.compare(password, storedCredentials.password_hash);

      // This is the CRITICAL part for hashing:
      // This example is INSECURE for frontend. You'd replace this with an Edge Function call.
      // For a backend/Edge Function: await bcrypt.compare(password, storedCredentials.password_hash);
      if (email === storedCredentials.email && passwordMatch) {
        setIsAuthenticated(true);
        localStorage.setItem('admin_authenticated', 'true');
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login error (custom auth):', error);
      return false;
    }
  };

  // Logout now just clears client-side auth state
  const logout = async (): Promise<void> => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated'); // Manually clear auth status
    // No Supabase auth.signOut() call here
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const storedCredentials = await getAdminCredentials();

      if (!storedCredentials) {
          console.error('Cannot change password: Admin credentials not found.');
          return false;
      }

      // Verify current password against the one stored
      // WARNING: In production, compare hashed passwords here!
      if (currentPassword !== storedCredentials.password_hash) {
        console.warn('Change password failed: Current password mismatch.');
        return false;
      }

      // Basic validation for new password
      if (!newPassword || newPassword.length < 6) {
        console.warn('Change password failed: New password too short or empty.');
        return false;
      }

      // Update password in admin_settings table
      // WARNING: In production, hash newPassword before storing!
      const { error: dbError } = await supabase
        .from('admin_settings')
        .upsert({
          setting_name: 'admin_credentials',
          setting_value: { email: storedCredentials.email, password: newPassword } // Update password, keep email
        }, { onConflict: 'setting_name' }); // Use setting_name as conflict key

      if (dbError) {
        console.error('Error updating password in admin_settings:', dbError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Change password error (custom auth):', error);
      return false;
    }
  };


  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      login,
      logout,
      changePassword,
      getCurrentPassword,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};