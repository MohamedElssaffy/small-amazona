import nc from 'next-connect';
import bcrypt from 'bcryptjs';
import User from '../../../models/User';
import db from '../../../utils/db';
import { isAuth, signToken } from '../../../utils/auth';

const handler = nc();

handler.use(isAuth);

handler.put(async (req, res) => {
  try {
    const { name, email, password } = req.body;
    await db.connect();
    const user = await User.findById(req.user._id);
    if (name) {
      user.name = name;
    }

    if (email) {
      user.email = email;
    }
    if (password) {
      user.password = bcrypt.hashSync(password);
    }

    await user.save();

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
