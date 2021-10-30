import nc from 'next-connect';
import Product from '../../../../models/Product';
import { isAuth } from '../../../../utils/auth';
import db from '../../../../utils/db';
import { onError } from '../../../../utils/error';

const handler = nc({ onError });

handler.use(isAuth).post(async (req, res) => {
  const { comment, rating } = req.body;
  await db.connect();

  const product = await Product.findById(req.query.id);

  if (product) {
    const existReview = product.reviews.find(
      (r) => r.user.toString() === req.user._id
    );

    if (existReview) {
      const reviews = product.reviews.map((r) => {
        if (r._id === existReview._id) {
          r.comment = comment;
          r.rating = rating;
          return r;
        }
        return r;
      });

      product.reviews = reviews;
      product.numReviews = reviews.length;
      product.rating =
        reviews.reduce((a, c) => a + c.rating, 0) / reviews.length;

      await product.save();

      res.send(product.reviews);
      await db.disconnect();
    } else {
      const newReview = {
        user: req.user._id,
        name: req.user.name,
        comment,
        rating,
      };

      product.reviews.unshift(newReview);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((a, c) => a + c.rating, 0) /
        product.reviews.length;
      await product.save();
      res.status(201).send(product.reviews);
      await db.disconnect();
    }
  } else {
    res.status(404).send({ message: 'Product Not found' });
    await db.disconnect();
  }
});

export default handler;
