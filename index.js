const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const chatRoute = require("./routes/chat");
const path = require("path");

dotenv.config();

const makeDBConnection = async () => {
  await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("Database Connected Successfully !");
};

const loadExpress = () => {
  const app = express();

  app.use("/images", express.static(path.join(__dirname, "public/images")));

  //middleware
  app.use(express.json());
  app.use(helmet());
  app.use(morgan("common"));

  // routes
  app.use("/api/auth", authRoute);
  app.use("/api/users", userRoute);
  app.use("/api/posts", postRoute);
  app.use("/api/chats", chatRoute);

  // multer configuration

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/images");
    },
    filename: (req, file, cb) => {
      cb(null, req.body.name);
    },
  });

  const upload = multer({ storage: storage });
  app.post("/api/upload", upload.single("file"), (req, res) => {
    try {
      return res.status(200).json("File uploded successfully");
    } catch (error) {
      console.error(error);
    }
  });

  // status check

  app.get("/status", (req, res) => {
    res.send("Welcome to Smartlad Server");
  });

  return app;
};

const startServer = async () => {
  const app = loadExpress();

  await makeDBConnection();

  const port = process.env.PORT ?? 8800;

  app.listen(port, () => {
    console.log(`Server running on PORT : ${port}`);
  });
};

startServer();
