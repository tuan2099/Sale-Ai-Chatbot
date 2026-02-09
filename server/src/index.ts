import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from 'passport';
import './config/passport'; // Import passport config
import helmet from 'helmet';
import morgan from 'morgan';

dotenv.config();

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import customerRoutes from './routes/customerRoutes';
import storeRoutes from './routes/storeRoutes';
import uploadRoutes from './routes/uploadRoutes';
import knowledgeRoutes from './routes/knowledgeRoutes';
import chatRoutes from './routes/chatRoutes';
import conversationRoutes from './routes/conversationRoutes';
import teamRoutes from './routes/teamRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/team', teamRoutes);

app.get('/', (req, res) => {
    res.send('Sale AI Backend is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
