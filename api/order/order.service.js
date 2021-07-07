const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')

async function query(filterBy = {}) {
    try {
        const collection = await dbService.getCollection('order')
        const allOrders = await collection.find({}).toArray()
        return allOrders
    } catch (err) {
        logger.error('cannot find orders', err)
        throw err
    }
}

//CURRENTLY NOT IN USE
// async function remove(orderId) {
//     try {
//         const store = asyncLocalStorage.getStore()
//         const { userId, isAdmin } = store
//         const collection = await dbService.getCollection('order')
//         // remove only if user is owner/admin
//         const query = { _id: ObjectId(orderId) }
//         if (!isAdmin) query.byUserId = ObjectId(userId)
//         await collection.deleteOne(query)
//         // return await collection.deleteOne({ _id: ObjectId(orderId), byUserId: ObjectId(userId) })
//     } catch (err) {
//         logger.error(`cannot remove order ${orderId}`, err)
//         throw err
//     }
// }

async function add(order) {
    try {
        const collection = await dbService.getCollection('order')
        await collection.insertOne(order)
        return order;
    } catch (err) {
        logger.error('cannot insert order', err)
        throw err
    }
}

async function getById(orderId) {
    try {
        const collection = await dbService.getCollection('order');
        const order = await collection.findOne({ _id: ObjectId(orderId) });
        return order;
    } catch (err) {
        throw err;
    }
}

async function save(order) {
    console.log('order:', order)
    try {
        let savedOrder = null;
        const collection = await dbService.getCollection('order');
        if (order._id) {
            const orderToUpdate = { ...order };// change to only updatable fields
            delete orderToUpdate._id;
            await collection.updateOne({'_id': ObjectId(order._id) }, { $set: orderToUpdate });
            return order;
        } else {
            order.createdAt = Date.now();
            savedOrder = await collection.insert(order);
            
            return savedOrder;
        }
    } catch (err) {
        throw err;
    }
}

module.exports = {
    query,
    add,
    getById,
    save,
}


