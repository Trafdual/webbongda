const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const Handelbars = require('handlebars');
const hbs = require('express-handlebars');
const hbs1 = require('hbs');

const methodOverride = require('method-override');
const path = require('path')
const cors = require('cors');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const handle=require('./routes/hbs');
const thongtinadmin=require('./routes/thongtinadminroutes');
const thongtinuser=require('./routes/thongtinuser');
const loaisanbongRoutes=require('./routes/LoaiSanBongRoutes')
const sanbongRoutes=require('./routes/SanBongRoutes')
const dothueRoutes=require('./routes/DoThueRoutes')

var app = express();

app.engine(".hbs", hbs.engine({
  extname: "hbs",
  defaultLayout: false,
  layoutsDir: "views/layouts/",
  handlebars: allowInsecurePrototypeAccess(Handelbars)
}));

app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, "views"));
app.use(methodOverride('_method'));

const uri = "mongodb+srv://webbongda:webbongda2024@webbongda.me9wj.mongodb.net/webbongda?retryWrites=true&w=majority&appName=webbongda";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(console.log("kết nối thành công"));

const mongoStoreOptions = {
  mongooseConnection: mongoose.connection,
  mongoUrl: uri,
  collection: 'sessions',
};

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create(mongoStoreOptions),
  cookie: {
    secure: false,
  }
}));
app.use(cors());
app.use(express.static(path.join(__dirname, '/styles')))
app.use(express.static(path.join(__dirname, '/images')))
hbs1.registerPartials(path.join(__dirname, 'views/components'));
app.use('/',handle);
app.use('/',thongtinadmin);
app.use('/',thongtinuser);
app.use('/', loaisanbongRoutes)
app.use('/', sanbongRoutes)
app.use('/', dothueRoutes)

app.listen(8080, () => {
  try {
    console.log('kết nối thành công 8080')
  } catch (error) {
    console.log('kết nối thất bại 8080', error)
  }
}
);