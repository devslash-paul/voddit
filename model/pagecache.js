var mongoose = require('mongoose');

var pageSchema = mongoose.Schema({
    url: {type:String, unique: true},
    updated: Date,
    content: Object
});

var Page = mongoose.model('PageCache', pageSchema);

module.exports = Page;