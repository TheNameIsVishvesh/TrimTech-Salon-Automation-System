const mongoose = require('mongoose');
const Service = require('../models/Service');
const Inventory = require('../models/Inventory');
const ServiceConsumable = require('../models/ServiceConsumable');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Fetch existing services to link
    const haircut = await Service.findOne({ name: 'Haircut' });
    const hairColor = await Service.findOne({ name: 'Hair Color' });
    const bodyMassage = await Service.findOne({ name: 'Body Massage' });
    const basicFacial = await Service.findOne({ name: 'Basic Facial' });

    if (!haircut || !hairColor) {
        console.error('Run npm run seed first to populate services.');
        process.exit(1);
    }

    // Step 1: Create Inventory items
    await Inventory.deleteMany({});

    const currInventory = await Inventory.insertMany([
        { productName: 'Premium Shampoo', category: 'Hair Care', totalStock: 5000, unit: 'ml', lowStockThreshold: 500 },
        { productName: 'Hair Color Tube (Black)', category: 'Hair Care', totalStock: 2000, unit: 'ml', lowStockThreshold: 200 },
        { flipStock: 0, productName: 'Aroma Massage Oil', category: 'Spa Supplies', totalStock: 3000, unit: 'ml', lowStockThreshold: 300 },
        { productName: 'Herbal Facial Scrub', category: 'Skin Care', totalStock: 1000, unit: 'g', lowStockThreshold: 100 }
    ]);
    console.log('Inventory items created.');

    const shampoo = await Inventory.findOne({ productName: 'Premium Shampoo' });
    const colorTube = await Inventory.findOne({ productName: 'Hair Color Tube (Black)' });
    const massageOil = await Inventory.findOne({ productName: 'Aroma Massage Oil' });
    const facialScrub = await Inventory.findOne({ productName: 'Herbal Facial Scrub' });

    // Step 2: Link Services to Consumables
    await ServiceConsumable.deleteMany({});

    await ServiceConsumable.insertMany([
        { serviceId: haircut._id, productId: shampoo._id, quantityUsed: 20 },      // 20ml per haircut
        { serviceId: hairColor._id, productId: colorTube._id, quantityUsed: 50 },  // 50ml per hair color
        { serviceId: bodyMassage._id, productId: massageOil._id, quantityUsed: 30 }, // 30ml per massage
        { serviceId: basicFacial._id, productId: facialScrub._id, quantityUsed: 15 } // 15g per facial
    ]);

    console.log('Service to Consumables successfully linked!');

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
