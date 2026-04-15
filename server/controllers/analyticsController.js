const Appointment = require('../models/Appointment');
const User = require('../models/User');

exports.getRevenueAnalytics = async (req, res) => {
    try {
        const { filter } = req.query; // e.g., 'today', 'weekly', 'monthly', 'all'
        let dateFilter = {};
        const now = new Date();

        if (filter === 'today') {
            const startOfDay = new Date(now.setHours(0, 0, 0, 0));
            dateFilter = { date: { $gte: startOfDay } };
        } else if (filter === 'weekly') {
            const startOfWeek = new Date(now.setDate(now.getDate() - 7));
            dateFilter = { date: { $gte: startOfWeek } };
        } else if (filter === 'monthly') {
            const startOfMonth = new Date(now.setMonth(now.getMonth() - 1));
            dateFilter = { date: { $gte: startOfMonth } };
        } // else 'all'

        const appointments = await Appointment.find({
            ...dateFilter,
            status: 'completed'
        }).populate('serviceId', 'name');

        // Daily Revenue
        const dailyMap = {};
        // Monthly Revenue
        const monthlyMap = {};
        // Service-wise
        const serviceMap = {};

        appointments.forEach(apt => {
            if (!apt.date) return;
            const ptDate = new Date(apt.date);
            const dayKey = ptDate.toISOString().split('T')[0];
            const monthKey = `${ptDate.getFullYear()}-${(ptDate.getMonth() + 1).toString().padStart(2, '0')}`;

            const revenue = apt.totalAmount || 0;

            dailyMap[dayKey] = (dailyMap[dayKey] || 0) + revenue;
            monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + revenue;

            if (apt.serviceId && apt.serviceId.name) {
                const sName = apt.serviceId.name;
                serviceMap[sName] = (serviceMap[sName] || 0) + revenue;
            } else {
                const sName = 'Deleted/Unknown Service';
                serviceMap[sName] = (serviceMap[sName] || 0) + revenue;
            }
        });

        res.json({
            daily: Object.entries(dailyMap).map(([date, revenue]) => ({ date, revenue })).sort((a, b) => a.date.localeCompare(b.date)),
            monthly: Object.entries(monthlyMap).map(([month, revenue]) => ({ month, revenue })).sort((a, b) => a.month.localeCompare(b.month)),
            serviceWise: Object.entries(serviceMap).map(([service, revenue]) => ({ service, revenue }))
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getEmployeePerformance = async (req, res) => {
    try {
        const employees = await User.find({ role: 'employee' }).select('name employeeId');
        const appointments = await Appointment.find({ status: { $ne: 'cancelled' } });

        const performance = employees.map(emp => {
            const empApts = appointments.filter(a => a.employeeId && a.employeeId.toString() === emp._id.toString());

            const totalBookings = empApts.length;
            const completedApts = empApts.filter(a => a.status === 'completed');

            const totalRevenue = completedApts.reduce((sum, a) => sum + (a.totalAmount || 0), 0);

            const completionRate = totalBookings > 0 ? ((completedApts.length / totalBookings) * 100).toFixed(1) : 0;

            // Avg service time based on duration field
            const totalDuration = completedApts.reduce((sum, a) => sum + (a.duration || 0), 0);
            const avgServiceTime = completedApts.length > 0 ? (totalDuration / completedApts.length).toFixed(0) : 0;

            return {
                _id: emp._id,
                name: emp.name,
                employeeId: emp.employeeId,
                totalBookings,
                completedBookings: completedApts.length,
                totalRevenue,
                avgServiceTime,
                completionRate
            };
        });

        res.json(performance.sort((a, b) => b.totalRevenue - a.totalRevenue)); // sort by Top Performer

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getNoShowAnalytics = async (req, res) => {
    try {
        const appointments = await Appointment.find({ status: { $ne: 'cancelled' } }).populate('clientId', 'name email phone');

        const totalBookings = appointments.length;
        const noShows = appointments.filter(a => a.status === 'no_show');

        const noShowRate = totalBookings > 0 ? ((noShows.length / totalBookings) * 100).toFixed(1) : 0;

        const clientMap = {};
        noShows.forEach(a => {
            if (!a.clientId) return;
            const cid = a.clientId._id.toString();
            if (!clientMap[cid]) {
                clientMap[cid] = {
                    client: a.clientId,
                    noShowCount: 0
                };
            }
            clientMap[cid].noShowCount += 1;
        });

        const frequentNoShows = Object.values(clientMap).sort((a, b) => b.noShowCount - a.noShowCount);

        res.json({
            totalBookings,
            totalNoShows: noShows.length,
            noShowRate,
            frequentNoShows
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getDashboardSummary = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointmentsToday = await Appointment.find({ date: { $gte: today, $lt: tomorrow } });
        const completedToday = appointmentsToday.filter(a => a.status === 'completed');

        const dailyRevenue = completedToday.reduce((sum, a) => sum + (a.totalAmount || 0), 0);

        res.json({
            appointmentsToday: appointmentsToday.length,
            completedToday: completedToday.length,
            revenueToday: dailyRevenue,
            noShowsToday: appointmentsToday.filter(a => a.status === 'no_show').length
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
