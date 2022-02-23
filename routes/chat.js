const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const PrivateChat = require("../models/PrivateChats");
const Chat = require("../models/Chat");

// Private Chat Section

// get all chats

router.get("/private", async (req, res) => {
  const { user1, user2 } = req.query;
  try {
    const chats = await PrivateChat.find({
      sender: { $in: [user1, user2] },
      receiver: { $in: [user1, user2] },
    }).lean();
    res.status(200).json({ chats });
  } catch (err) {
    res.status(500).json(err);
  }
});

// new private chat

router.post("/private", async (req, res) => {
  const newPost = new PrivateChat(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Group Chat Section
// new chat

router.post("/", async (req, res) => {
  const newPost = new Chat(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

// edit message

router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("the post has been updated");
    } else {
      res.status(403).json("you can update only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//delete a post

router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("the post has been deleted");
    } else {
      res.status(403).json("you can delete only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//get a post

router.get("/get-all-chats", async (req, res) => {
  try {
    const group = req.query.group;

    const chats = await Chat.find({ group }).lean();

    res.status(200).json(chats);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
