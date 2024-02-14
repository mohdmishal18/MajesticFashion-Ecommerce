const mongoDB = require('./config/mongodb');
mongoDB.connectDB();

const express = require("express");
const app = express();
const path = require("path");
const flash = require("express-flash");

const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const nocache = require("nocache");

app.use('/static',express.static(path.join(__dirname, 'public/assets')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());

app.use('/',userRoutes);
app.use('/admin',adminRoutes);

const port = process.env.PORT || 3001;

app.listen(port,() =>
{
    console.log(`server is running on http://localhost:${port}`);
})