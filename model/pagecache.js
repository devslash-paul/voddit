var mongoose = require('mongoose');

var pageSchema = mongoose.Schema({
    url: String,
    updated: Date,
    results: JSON
});