import nc from 'next-connect';
import Order from '../../../models/Order';
import db from '../../../utils/db';
import { onError } from '../../../utils/error';
import { isAuth, isAdmin } from '../../../utils/auth';
import User from '../../../models/User';
import Product from '../../../models/Product';

const handler = nc({ onError });

handler.use(isAuth, isAdmin);

handler.get(async (req, res) => {
  await db.connect();

  const ordersCount = await Order.countDocuments();
  const productsCount = await Product.countDocuments();
  const usersCount = await User.countDocuments();

  const salesData = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        totalSales: { $sum: '$totalPrice' },
      },
    },
  ]);

  const ordersPrice =
    salesData.length > 0
      ? salesData.length === 1
        ? salesData[0].totalSales
        : salesData.reduce((a, c) => a + c.totalSales, 0)
      : 0;

  await db.disconnect();

  res.send({ ordersCount, usersCount, productsCount, ordersPrice, salesData });
});

export default handler;
