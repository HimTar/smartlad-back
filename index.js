const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const { ObjectId } = require("mongodb");

const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const chatRoute = require("./routes/chat");

const Image = require("./models/Image");

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

  app.use(cors());

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

  // const storage = multer.diskStorage({
  //   destination: (req, file, cb) => {
  //     cb(null, "public/images/temp");
  //   },
  // });

  // const upload = multer({ storage: storage });

  // app.post("/api/upload", upload.single("file"), (req, res) => {
  //   try {
  //     return res.status(200).json("File uploded successfully");
  //   } catch (error) {
  //     console.error(error);
  //   }
  // });

  const upload = multer({ dest: "assets/files" });

  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ status: 400, message: "File not attached !" });
      }

      var img = fs.readFileSync(req.file.path);
      var encode_image = img.toString("base64");

      var finalImg = {
        contentType: req.file.mimetype,
        image: new Buffer(encode_image, "base64"),
      };

      const image = new Image(finalImg);

      const { _id } = await image.save();

      res.status(200).json({
        status: 200,
        body: {
          link: "https://smartlad.herokuapp.com/api/image/" + _id,
        },
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({ status: 500, message: "Internal Server Error !" });
    }
  });

  app.get("/api/image/:id", async (req, res) => {
    try {
      const id = req.params.id;

      if (!id) {
        return res
          .status(400)
          .json({ status: 400, message: "Image link invalid !" });
      }

      const data = await Image.findOne({ _id: ObjectId(id) });

      res.contentType(data.contentType);
      res.send(data.image);
    } catch (err) {
      console.log(err);

      res.status(500).json({ status: 500, message: "Internal Server Error !" });
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
