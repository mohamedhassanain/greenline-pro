import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log('useAuth: useEffect started');
    
    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log('useAuth: Calling getSession()...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('useAuth: getSession() response', { 
          hasSession: !!session,
          session,
          error: sessionError 
        });
        
        if (sessionError) {
          console.error('useAuth: Error getting session', sessionError);
          setError(new Error(sessionError.message));
          return;
        }

        console.log('useAuth: getSession response', { 
          hasSession: !!session, 
          user: session?.user?.email 
        });
        
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('useAuth: Unexpected error in initialization', error);
        setError(error instanceof Error ? error : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    console.log('useAuth: Setting up auth state listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useAuth: Auth state changed', { 
          event, 
          hasSession: !!session, 
          user: session?.user?.email 
        });
        
        try {
          setSession(session);
          setUser(session?.user ?? null);
        } catch (error) {
          console.error('useAuth: Error in auth state change handler', error);
          setError(error instanceof Error ? error : new Error('Error processing auth state change'));
        } finally {
          setLoading(false);
        }
      }
    );

    return () => {
      console.log('useAuth: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string, fullName: string, companyName: string) => {
    // Check if this is the owner email
    const isOwner = email.toLowerCase() === 'admin@greenlinepro.com' || 
                   email.toLowerCase() === 'owner@greenlinepro.com' ||
                   email.toLowerCase().includes('proprietaire');
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName,
          role: isOwner ? 'owner' : 'user',
        },
      },
    });

    if (data.user && !error) {
      // Create profile
      await supabase.from('profiles').insert({
        user_id: data.user.id,
        full_name: fullName,
        company_name: companyName,
        role: isOwner ? 'owner' : 'user',
      });
    }

    return { data, error };
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signOut error:', error);
        throw error;
      }
      
      // Clear local state immediately
      setUser(null);
      setSession(null);
      
      return { error: null };
    } catch (error) {
      console.error('SignOut error:', error);
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  };

  return {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
};