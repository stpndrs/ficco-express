import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRoutes from './routes/auth.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import salesRoutes from './routes/sales.routes.js';
import purchasingRoutes from './routes/purchasing.routes.js';
import unitsRoutes from './routes/units.routes.js';
import productsRoutes from './routes/products.routes.js';
import inventoriesRoutes from './routes/inventory.routes.js';
import productionRoutes from './routes/production.routes.js';
import materialsRoutes from './routes/materials.routes.js';
import operationalsRoutes from './routes/operationals.routes.js';
import usersRoutes from './routes/users.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/purchasing', purchasingRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/units', unitsRoutes);
app.use('/api/inventories', inventoriesRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/operationals', operationalsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/reports', reportsRoutes);

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

app.get('/', (req, res) => {
    res.json({ message: 'API is running...' });
});

app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});