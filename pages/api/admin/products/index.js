import nc from 'next-connect';
import Product from '../../../../models/Product';
import { isAdmin, isAuth } from '../../../../utils/auth';
import db from '../../../../utils/db';
import { onError } from '../../../../utils/error';

const handler = nc({ onError });

handler.use(isAuth, isAdmin);

handler.get(async (req, res) => {
  try {
    await db.connect();
    const products = await Product.find({});
    await db.disconnect();
    res.send(products);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Something went wrong' });
  }
});

handler.post(async (req, res) => {
  try {
    await db.connect();
    const newProduct = new Product({
      name: 'simple name',
      slug: 'sample-slug' + Math.random(),
      price: 0,
      countInStock: 0,
      image: '/images/shirt1.jpg',
      description: 'sample description',
      brand: 'sample brand',
      category: 'sample category',
      rating: 0,
      numReview: 0,
    });

    const product = await newProduct.save();
    await db.disconnect();
    res.status(201).send(product);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Something went wrong' });
  }
});

export default handler;
