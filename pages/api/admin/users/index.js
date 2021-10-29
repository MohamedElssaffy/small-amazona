import nc from 'next-connect';
import User from '../../../../models/User';
import { isAdmin, isAuth } from '../../../../utils/auth';
import db from '../../../../utils/db';
import { onError } from '../../../../utils/error';

const handler = nc({ onError });

handler.use(isAuth, isAdmin);

handler.get(async (req, res) => {
  try {
    await db.connect();
    const users = await User.find({});
    await db.disconnect();
    res.send(users);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Something went wrong' });
  }
});

export default handler;
