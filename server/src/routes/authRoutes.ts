import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { login, register, forgotPassword, resetPassword } from '../controllers/authController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);


// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    (req, res) => {
        // Generate JWT for the authenticated user
        const user = req.user as any;
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '1h' }
        );
        // Redirect to frontend with token
        res.redirect(`http://localhost:3000/dashboard?token=${token}`);
    }
);

// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get(
    '/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login', session: false }),
    (req, res) => {
        const user = req.user as any;
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '1h' }
        );
        res.redirect(`http://localhost:3000/dashboard?token=${token}`);
    }
);

export default router;
