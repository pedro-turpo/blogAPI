require('dotenv').config(); //esto siempre va en la primera linea

const initModel = require('./models/initModels');
const app = require('./app');
const { db } = require('./database/config');
const { Server } = require('socket.io');
const Sockets = require('./sockets');

db.authenticate()
  .then(() => console.log('Database connected🤙...'))
  .catch((error) => console.log(error));

initModel();

db.sync({ force: false })
  .then(() => console.log('Database synced🤙...'))
  .catch((error) => console.log(error));

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});


new Sockets(io)