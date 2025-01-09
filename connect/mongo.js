const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

module.exports = ({ uri, username, password, connectionOptions = {} }) => {
  const authUri = username && password
    ? `mongodb+srv://${username}:${encodeURIComponent(password)}@${uri}`
    : `mongodb://${uri}`;


  // Connect to MongoDB
  mongoose.connect(authUri, connectionOptions);

  // When successfully connected
  mongoose.connection.on('connected', function () {
    console.log('💾  Mongoose connection successfully established to ' + authUri);
  });

  // If the connection throws an error
  mongoose.connection.on('error', (error) => {
    console.error('💾  Mongoose connection error: ', error);
    console.log(
      '=> If using local MongoDB: ensure the MongoDB server is running.\n' +
      '=> If using a remote MongoDB instance: verify the URI, username, password, and internet connection.\n'
    );
  });

  // When the connection is disconnected
  mongoose.connection.on('disconnected', () => {
    console.log('💾  Mongoose connection disconnected');
  });

  // If the Node process ends, close the Mongoose connection
  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.log('💾  Mongoose connection closed through app termination');
      process.exit(0);
    });
  });
};
