import Dexie from 'dexie';

const db = new Dexie("MushroomDB");

db.version(1).stores({
    products: '++id, name, category, source, price, cost_price, stock, unit',
    sales: '++id, date, type, total_price, customer_name, customer_address, customer_phone, status',
    customers: '++id, name, phone, address',
    inventory_logs: '++id, product_id, date, change_type, quantity, note'
});

export default db;
