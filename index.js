import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const DB =
  "mongodb://yashyeltiwar01:Yash%40123456@ac-boaqvhw-shard-00-00.ecybspw.mongodb.net:27017,ac-boaqvhw-shard-00-01.ecybspw.mongodb.net:27017,ac-boaqvhw-shard-00-02.ecybspw.mongodb.net:27017/AuthUsers?ssl=true&replicaSet=atlas-f0dwt1-shard-0&authSource=admin&retryWrites=true&w=majority";
mongoose
  .connect(
    DB,
    {
      dbName: "backend",
    },
    {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }
  )
  .then(() => console.log("Database connected"))
  .catch((e) => console.log(e));

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const user = mongoose.model("User", userSchema);
const app = express();

app.use(express.static(path.join(path.resolve(), "public")));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const decoded = jwt.verify(token, "dwefefrerfgergerg");
    req.User = await user.findById(decoded._id);
    next();
  } else {
    res.render("login");
  }
};
app.get("/", isAuthenticated, (req, res) => {
  res.render("logout", { name: req.User.name });
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.redirect("/");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  let User = await user.findOne({ email });
  if (User) {
    return res.redirect("/login");
  }
  const hashPass = await bcrypt.hash(password, 10);
  User = await user.create({
    name,
    email,
    password: hashPass,
  });

  const token = jwt.sign({ _id: User._id }, "dwefefrerfgergerg");
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let User = await user.findOne({ email });
  if (!User) {
    return res.redirect("/register");
  }
  const isMatch = await bcrypt.compare(password, User.password);
  if (!isMatch) {
    return res.render("login", { email, message: "Incorrect password" });
  }
  const token = jwt.sign({ _id: User._id }, "dwefefrerfgergerg");
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });

  res.redirect("/");
});

app.listen(5000, () => {
  console.log("listening");
});
