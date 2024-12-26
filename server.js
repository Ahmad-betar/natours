const mongoose = require('mongoose');
const app = require('./app');

const DB = process.env.LOCAL_DATABASE;

const port = 3000;
console.log(DB);

mongoose.connect(DB).then((conf) => {
  console.log('Connected Successfully');
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', () => {
  server.close(() => {
    console.log('Server is closing...');
    process.exit(1);
  });
});

process.on('uncaughtException', () => {
  console.log('Uncaught exception... Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
