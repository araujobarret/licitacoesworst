let mongoose = require('mongoose');

let serverUri = "mongodb://root:dilmasafada@ds023523.mlab.com:23523/licitacoesworst";

mongoose.Promise = global.Promise;
mongoose.connect(serverUri);

module.exports = {
	mongoose
};