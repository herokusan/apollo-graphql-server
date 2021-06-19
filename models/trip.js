const mongoose = require('mongoose')
const schema = mongoose.Schema

const tripSchema = new schema({
    fromPlace: {id: String},
    toPlace: {id: String}
})

module.exports = mongoose.model('Trip', tripSchema)