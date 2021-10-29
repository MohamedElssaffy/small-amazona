import nc from 'next-connect';
import User from '../../../../../models/User';
import { isAdmin, isAuth } from '../../../../../utils/auth';
import db from '../../../../../utils/db';
import { onError } from '../../../../../utils/error';

const handler = nc({ onError });

handler.use(isAuth, isAdmin);

handler.get(async (req, res) => {
  try {
    await db.connect();
    const user = await User.findById(req.query.id);
    await db.disconnect();
    res.send(user);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Something went wrong' });
  }
});
handler.put(async (req, res) => {
  const { name, isAdmin } = req.body;
  try {
    await db.connect();
    const user = await User.findById(req.query.id);
    if (!user) return res.status(404).send({ message: 'User not found' });

    if (name) {
      user.name = name;
    }
    user.isAdmin = isAdmin;

    await user.save();
    res.send(user);
    await db.disconnect();
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Something went wrong' });
  }
});

handler.delete(async (req, res) => {
  try {
    await db.connect();
    await User.findByIdAndRemove(req.query.id);
    await db.disconnect();
    res.send({ message: 'User removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Something went wrong' });
  }
});

export default handler;
