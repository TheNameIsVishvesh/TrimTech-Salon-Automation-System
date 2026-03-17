const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
const User = require('./models/User');
const { getRevenueAnalytics, getEmployeePerformance, getNoShowAnalytics } = require('./controllers/analyticsController');

mongoose.connect('mongodb://localhost:27017/trimtech').then(async () => {
    let currentMethod = '';
    const req = { query: { filter: 'all' } };
    const res = {
        json: (data) => console.log(currentMethod, 'SUCCESS'),
        status: (code) => {
            console.log(currentMethod, 'STATUS', code);
            return { json: (err) => console.log(currentMethod, 'ERROR', err) };
        }
    };
    try {
        currentMethod = 'REVENUE';
        await getRevenueAnalytics(req, res);
        currentMethod = 'PERFORMANCE';
        await getEmployeePerformance(req, res);
        currentMethod = 'NO SHOW';
        await getNoShowAnalytics(req, res);
    } catch (err) {
        console.error('CRASH:', err);
    }
    process.exit(0);
});
