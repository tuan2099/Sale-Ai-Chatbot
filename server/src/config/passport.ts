import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || 'your_google_client_id',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your_google_client_secret',
            callbackURL: '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user exists by email
                const email = profile.emails?.[0].value;
                if (!email) {
                    return done(new Error('No email found in Google profile'), undefined);
                }

                let user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user) {
                    // Create new user
                    user = await prisma.user.create({
                        data: {
                            email,
                            name: profile.displayName,
                            image: profile.photos?.[0].value,
                            emailVerified: new Date(),
                        },
                    });
                }

                // Link account if not already linked (simplified logic)
                // In a real app, you'd check prisma.account.findUnique first
                const existingAccount = await prisma.account.findFirst({
                    where: {
                        provider: 'google',
                        providerAccountId: profile.id
                    }
                })

                if (!existingAccount) {
                    await prisma.account.create({
                        data: {
                            userId: user.id,
                            type: 'oauth',
                            provider: 'google',
                            providerAccountId: profile.id,
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        }
                    })
                }

                return done(null, user);
            } catch (error) {
                return done(error, undefined);
            }
        }
    )
);

passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_APP_ID || 'your_facebook_app_id',
            clientSecret: process.env.FACEBOOK_APP_SECRET || 'your_facebook_app_secret',
            callbackURL: '/api/auth/facebook/callback',
            profileFields: ['id', 'displayName', 'photos', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0].value;
                // Note: Facebook might not return email if user didn't grant permission or used phone number
                // For this MVP, we'll require email or handle it carefully.
                if (!email) {
                    // Alternative: Create user without email or use a placeholder
                    return done(new Error('No email found in Facebook profile'), undefined);
                }

                let user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            email,
                            name: profile.displayName,
                            image: profile.photos?.[0].value,
                            emailVerified: new Date(),
                        },
                    });
                }

                const existingAccount = await prisma.account.findFirst({
                    where: {
                        provider: 'facebook',
                        providerAccountId: profile.id
                    }
                })

                if (!existingAccount) {
                    await prisma.account.create({
                        data: {
                            userId: user.id,
                            type: 'oauth',
                            provider: 'facebook',
                            providerAccountId: profile.id,
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        }
                    })
                }

                return done(null, user);
            } catch (error) {
                return done(error, undefined);
            }
        }
    )
);

export default passport;
