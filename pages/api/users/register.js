import nc from 'next-connect';
import bcrypt from 'bcryptjs';
import User from '../../../models/User';
import db from '../../../utils/db';
import { signToken } from '../../../utils/auth';

const handler = nc();

handler.post(async (req, res) => {
  try {
    await db.connect();
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
      isAdmin: false,
    });
    const user = await newUser.save();
    await db.disconnect();

    const token = signToken(user);

    res.send({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).send({ message: 'user already exist' });
    }
    res
      .status(500)
      .send({ message: 'Something went wrong please try again later' });
  }
});

export default handler;
