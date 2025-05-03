// const bcrypt = require("bcryptjs");
// const User = require("../models/user.model");

// exports.register = async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     const exists = await User.findOne({ where: { username } });
//     if (exists) return res.status(400).json({ message: "User already exists" });

//     const hashed = await bcrypt.hash(password, 10);
//     const user = await User.create({ username, password: hashed });

//     res.status(201).json({ message: "User created", userId: user.id });
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// };

// exports.login = async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     const user = await User.findOne({ where: { username } });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const match = await bcrypt.compare(password, user.password);
//     if (!match) return res.status(401).json({ message: "Invalid credentials" });

//     res.json({ message: "Login successful" });
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// };
