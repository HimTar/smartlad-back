const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

//REGISTER
router.post("/register", async (req, res) => {
  try {
    //generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //create new user
    const newUser = new User({
      username: req.body.username.toLowerCase(),
      email: req.body.email.toLowerCase(),
      password: hashedPassword,
      role: req.body.role,
    });

    //save user and respond
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    !user && res.status(404).json("user not found");

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword) return res.status(400).json("wrong password");

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/get-my-profile", async (req, res) => {
  try {
    const { username } = req.query;

    const data = await User.findOne(
      { username },
      "-isAdmin  -password -__v"
    ).lean();

    res.send({ userData: data });
  } catch (err) {
    res.status(500).json({ message: "something went wrong" });
  }
});

router.post("/update-profile", async (req, res) => {
  try {
    const { username, tags, profilePicture, coverPicture } = req.body;

    await User.findOneAndUpdate(
      { username },
      { tags, profilePicture, coverPicture }
    );

    res.send({ message: "Profile Updated !" });
  } catch (err) {
    res.status(500).json({ message: "something went wrong" });
  }
});

router.get("/network/:username", async (req, res) => {
  try {
    const { username } = req.params;

    let user = await User.findOne(
      { username },
      "followers followings tags"
    ).lean();

    user.followers = user.followers.map((fol) => ObjectId(fol));
    user.followings = user.followings.map((fol) => ObjectId(fol));

    const currentNetwork = [...user.followers, ...user.followings, user._id];

    const followers = await User.find(
      { _id: { $in: user.followers } },
      "username profilePicture role tags"
    ).lean();

    const following = await User.find(
      { _id: { $in: user.followings } },
      "username profilePicture role tags"
    ).lean();

    const suggestion = await User.find(
      { _id: { $nin: currentNetwork } },
      "username profilePicture role tags"
    ).lean();

    res.send({ followers, following, suggestion });
  } catch (err) {
    res.status(500).json({ message: "something went wrong" });
  }
});

module.exports = router;
