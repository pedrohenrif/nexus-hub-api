import express, { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config'; 
import routes from './routes/index'; 

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.json({ status: 'API Nexus Hub Online 🚀' });
});

app.use('/api', routes);

app.listen(PORT, () => {
    console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
});