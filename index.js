const app = require('express')();
const express = require('express');
const { db, dbPrefix } = require('./db');
const path = require('path');
const http = require('http').Server(app);
const validator = require('express-validator');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const cors = require('cors');

global.token = '';

/*
app.use(
  cors({
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200,
  })
);
*/

const allowedOrigins = [/^https?:\/\/(?:.*\.)?davidebalice\.dev$/, /^http:\/\/localhost(:\d+)?$/];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.some((regex) => regex.test(origin))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

process.on('unchaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('Unchaught Exception!');
  process.exit(1);
});

var session = require('express-session');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var i18n = require('i18n-express');

app.use(cookieParser());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.use(
  session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: true,
  })
);

app.use(flash());
app.use(
  i18n({
    translationsPath: path.join(__dirname, 'i18n'),
    siteLangs: ['es', 'en', 'de', 'ru', 'it', 'fr'],
    textsVarName: 'translation',
  })
);

app.use(express.static(path.join(__dirname, 'public')));

const authRouter = require('./routers/authRoutes');
const dashboardRouter = require('./routers/dashboardRoutes');
const databaseRouter = require('./routers/databaseRoutes');
const tableRouter = require('./routers/tableRoutes');
const designerRouter = require('./routers/designerRoutes');
const userRouter = require('./routers/userRoutes');

app.use('/api/', authRouter);
app.use('/api/', dashboardRouter);
app.use('/api/', databaseRouter);
app.use('/api/', tableRouter);
app.use('/api/', designerRouter);
app.use('/api/', userRouter);

http.listen(8000, function () {
  console.log('listening on *:8000');
});
