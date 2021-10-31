import nc from 'next-connect';
import Product from '../../../../../models/Product';
import { isAdmin, isAuth } from '../../../../../utils/auth';
import db from '../../../../../utils/db';
import { onError } from '../../../../../utils/error';

const handler = nc({ onError });

handler.use(isAuth, isAdmin);

handler.get(async (req, res) => {
  try {
    await db.connect();
    const product = await Product.findById(req.query.id);
    await db.disconnect();
    res.send(product);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Something went wrong' });
  }
});
handler.put(async (req, res) => {
  const {
    name,
    price,
    image,
    featuredImage,
    isFeatured,
    countInStock,
    description,
    brand,
    category,
  } = req.body;
  try {
    await db.connect();
    const product = await Product.findById(req.query.id);
    if (!product) return res.status(404).send({ message: 'Product not found' });

    if (name) {
      product.name = name;
      product.slug = name.toLowerCase().split(' ').join('-');
    }
    if (brand) product.brand = brand;
    if (price) product.price = price;
    if (category) product.category = category;
    if (description) product.description = description;
    if (countInStock) product.countInStock = countInStock;
    if (image) product.image = image;
    if (featuredImage) product.featuredImage = featuredImage;
    if (isFeatured) product.isFeatured = isFeatured;

    await product.save();
    res.send(product);
    await db.disconnect();
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Something went wrong' });
  }
});

handler.delete(async (req, res) => {
  try {
    await db.connect();
    await Product.findByIdAndRemove(req.query.id);
    await db.disconnect();
    res.send({ message: 'Product removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Something went wrong' });
  }
});

export default handler;
