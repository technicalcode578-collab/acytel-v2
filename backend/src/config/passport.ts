import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dbClient from '../core/database';
import { v4 as uuidv4 } from 'uuid';
import { User, GoogleUserProfile } from '../models/user';
import logger from '../utils/logger';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.GOOGLE_REDIRECT_URI!
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const googleProfile = profile as any;
    
    // Check if user already exists with Google ID
    const existingGoogleUserQuery = 'SELECT * FROM users WHERE google_id = ? LIMIT 1 ALLOW FILTERING';
    const existingGoogleUser = await dbClient.execute(existingGoogleUserQuery, [googleProfile.id], { prepare: true });
    
    if (existingGoogleUser.rowLength > 0) {
      const user = existingGoogleUser.first();
      logger.logAuthSuccess(user.id.toString(), 'N/A', 'google');
      return done(null, {
        id: user.id.toString(),
        email: user.email,
        displayName: user.display_name,
        profilePicture: user.profile_picture,
        authProvider: 'google'
      });
    }

    // Check if user exists with same email but different provider
    const existingEmailUserQuery = 'SELECT * FROM users WHERE email = ? LIMIT 1 ALLOW FILTERING';
    const existingEmailUser = await dbClient.execute(existingEmailUserQuery, [googleProfile.emails[0].value], { prepare: true });
    
    if (existingEmailUser.rowLength > 0) {
      // Link Google account to existing email account
      const user = existingEmailUser.first();
      const updateQuery = `
        UPDATE users 
        SET google_id = ?, display_name = ?, profile_picture = ?, auth_provider = ?, updated_at = ?
        WHERE id = ?
      `;
      const profilePicture = googleProfile.photos && googleProfile.photos.length > 0 
        ? googleProfile.photos[0].value : null;
      
      await dbClient.execute(updateQuery, [
        googleProfile.id,
        googleProfile.displayName,
        profilePicture,
        'google',
        new Date(),
        user.id
      ], { prepare: true });

      logger.logSecurityEvent('Linked Google account to existing email', { userId: user.id.toString() }, 'N/A');
      return done(null, {
        id: user.id.toString(),
        email: user.email,
        displayName: googleProfile.displayName,
        profilePicture: profilePicture,
        authProvider: 'google'
      });
    }

    // Create new user
    const userId = uuidv4();
    const now = new Date();
    const profilePicture = googleProfile.photos && googleProfile.photos.length > 0 
      ? googleProfile.photos[0].value : null;

    const insertQuery = `
      INSERT INTO users 
      (id, email, google_id, display_name, profile_picture, auth_provider, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await dbClient.execute(insertQuery, [
      userId,
      googleProfile.emails[0].value,
      googleProfile.id,
      googleProfile.displayName,
      profilePicture,
      'google',
      now,
      now
    ], { prepare: true });

    logger.logSecurityEvent('New user created via Google OAuth', { userId }, 'N/A');
    return done(null, {
      id: userId,
      email: googleProfile.emails[0].value,
      displayName: googleProfile.displayName,
      profilePicture: profilePicture,
      authProvider: 'google'
    });

  } catch (error) {
    logger.logSecurityEvent('Google OAuth error', { error }, undefined, 'N/A');
    console.error('Google OAuth error:', error);
    return done(error, false);
  }
}));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const userQuery = 'SELECT * FROM users WHERE id = ? LIMIT 1';
    const result = await dbClient.execute(userQuery, [id], { prepare: true });
    const user = result.first();
    
    if (user) {
      done(null, {
        id: user.id.toString(),
        email: user.email,
        displayName: user.display_name,
        profilePicture: user.profile_picture,
        authProvider: user.auth_provider
      });
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error, false);
  }
});

export default passport;