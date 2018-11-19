const mongoose = require('mongoose');

require('dotenv').config({ path: 'variables.env' });

mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise;
mongoose.connection.on('error', err =>  console.error(`Error  → ${err.message}`));

// import all models (singleton concept to load once is used)
require('./models/Store');
/////////////////////////
const app = require('./app');
app.set('port', process.env.PORT || 7777);
const server = app.listen(app.get('port'), () => {
  console.log(`Server running on port ${server.address().port}`);
});
