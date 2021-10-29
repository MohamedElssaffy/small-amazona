import nc from 'next-connect';
import Order from '../../../../../models/Order';
import db from '../../../../../utils/db';
import { isAdmin, isAuth } from '../../../../../utils/auth';

const handler = nc();

handler.use(isAuth, isAdmin);

handler.put(async (req, res) => {
  await db.connect();
  const order = await Order.findById(req.query.id);
  if (order) {
    order.isDelivered = true;
    order.deliverAt = Date.now();

    const deliverOrder = await order.save();
    res.send({ message: 'order deliver', order: deliverOrder });
    await db.disconnect();
  } else {
    res.status(404).send({ message: 'order not found' });
    await db.disconnect();
  }
});

export default handler;
