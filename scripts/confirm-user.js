/**
 * Script to manually confirm a user who is stuck in "Waiting for verification" status
 * 
 * IMPORTANT: This uses the SERVICE ROLE KEY which has admin privileges.
 * Only run this script locally, never ship it with your app!
 * 
 * Usage:
 * 1. Get your SERVICE ROLE KEY from Supabase Dashboard > Project Settings > API
 * 2. Replace YOUR_SERVICE_ROLE_KEY below with your actual service role key
 * 3. Replace USER_ID with the UID from your Supabase users table
 * 4. Run: node scripts/confirm-user.js
 */

const { createClient } = require('@supabase/supabase-js');

// Replace with your actual values
const supabaseUrl = 'https://ahjdgcoixcncwyfmtcmz.supabase.co';
const serviceRoleKey = 'YOUR_SERVICE_ROLE_KEY'; // Get this from Project Settings > API
const userId = '881bbe29-22c4-4267-9203-ef2b47454fa8'; // The UID from your screenshot

// Create admin client
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function confirmUser() {
  try {
    console.log('Confirming user:', userId);
    
    // Update user to mark email as confirmed
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      email_confirm: true
    });
    
    if (error) {
      console.error('Error confirming user:', error);
      process.exit(1);
    }
    
    console.log('✅ User confirmed successfully!');
    console.log('User ID:', data.user.id);
    console.log('Email confirmed:', data.user.email_confirmed_at);
    
    // The user should now be able to sign in normally
    console.log('\n🎉 The user can now sign in without OTP verification!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Run the script
confirmUser();
