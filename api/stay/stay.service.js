const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')
const logger = require('../../services/logger.service')


async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('stay')
        const stays = await collection.find(criteria).toArray()
        return stays
        // var stays = await collection.aggregate([
        //     {
        //         $match: filterBy
        //     },
        //     {
        //         $lookup:
        //         {
        //             localField: 'byUserId',
        //             from: 'user',
        //             foreignField: '_id',
        //             as: 'byUser'
        //         }
        //     },
        //     {
        //         $unwind: '$byUser'
        //     },
        //     {
        //         $lookup:
        //         {
        //             localField: 'aboutUserId',
        //             from: 'user',
        //             foreignField: '_id',
        //             as: 'aboutUser'
        //         }
        //     },
        //     {
        //         $unwind: '$aboutUser'
        //     }
        // ]).toArray()

    } catch (err) {
        logger.error('cannot find stays', err)
        throw err
    }

}

async function remove(stayId) {
    try {
        const store = asyncLocalStorage.getStore()
        const { userId } = store
        console.log("🚀 ~ file: stay.service.js ~ line 54 ~ remove ~ userId", userId)
        const collection = await dbService.getCollection('stay')
        // remove only if user is owner/admin
        const query = { _id: ObjectId(stayId) }
        const stay = await collection.findOne({"_id":ObjectId(stayId)})
        console.log("🚀 ~ file: stay.service.js ~ line 61 ~ remove ~ stay.host._id", stay.host._id) 
        if(stay.host._id !== userId) res.status(401).send({ err: 'Failed to Delete' })
        await collection.deleteOne(query)
        // return await collection.deleteOne({ _id: ObjectId(reviewId), byUserId: ObjectId(userId) })
    } catch (err) {
        logger.error(`cannot remove stay ${stayId}`, err)
        throw err
    }
}

async function add(stay){
    try{
        const collection = await dbService.getCollection('stay') //bring the collection
        await collection.insertOne(stay)
        return stay
    
}
catch(err){
    logger.error('cannot insert toy', err)
    throw err
}

}

async function update(stay) {
    try {
        // peek only updatable fields!
        const stayToAdd = {
            name: stay.name,
            price: stay.price,
            guests: stay.guests,
            imgUrls:stay.imgUrls,
            favorites:stay.favorites,
            reviews:stay.reviews
        }
        const collection = await dbService.getCollection('stay')
        await collection.insertOne(stayToAdd)
        return stayToAdd;
    } catch (err) {
        logger.error('cannot update stay', err)
        throw err
    }
}

async function getById (id){
    try{
        const collection = await dbService.getCollection('stay') //bring the collection
        const stay = await collection.findOne({"_id":ObjectId(id)})
        return stay
    }
    catch(err){
        logger.error('cannot find stay by id', err)
        throw err
    }
} 



function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.location) {
        const txtCriteria = { $regex: filterBy.location, $options: 'i' }
        criteria['loc.address'] =  txtCriteria 
    }
    if (filterBy.guests !=='0') {
        criteria.capacity = {$gte: parseInt(filterBy.guests)} 
    }
    // if(filterBy.price){
    //     criteria.price = filterBy.price
    // }
    console.log(criteria, 'criteria')
    return criteria
} 

module.exports = {
    query,
    remove,
    add,
    update,
    getById
}


