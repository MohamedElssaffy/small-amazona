import {
  Button,
  Card,
  CircularProgress,
  Grid,
  Link,
  List,
  ListItem,
  TextField,
  Typography,
} from '@material-ui/core';
import { Rating } from '@material-ui/lab';
import axios from 'axios';
import { useRouter } from 'next/router';
import Image from 'next/image';
import NextLink from 'next/link';
import React, { useContext, useState } from 'react';
import Layout from '../../components/Layout';
import Product from '../../models/Product';
import db from '../../utils/db';
import { Store } from '../../utils/store';
import useStyle from '../../utils/styles';
import { errorMsg } from '../../utils/error';
import { useSnackbar } from 'notistack';

export default function SingleProduct({ product }) {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const { userInfo, cart } = state;
  const classes = useStyle();

  const [reviews, setReviews] = useState(product.reviews || []);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  console.log(reviews);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  if (!product) {
    return <div>Product Not Found</div>;
  }

  const addToCartHandler = async () => {
    const { data } = await axios.get(`/api/products/${product._id}`);
    const existItem = cart.cartItems.find((item) => item._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;

    if (!data || data.countInStock < quantity) {
      return window.alert(`Sorry, the product ${product.name} is out of stock`);
    }

    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });
    router.push('/cart');
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(
        `/api/products/${product._id}/reviews`,
        { rating, comment },
        { headers: { authorization: `Bearer ${userInfo.token}` } }
      );
      setReviews(data);
      setComment('');
      setRating(0);
      enqueueSnackbar('Review Submitted Successfuly', { variant: 'success' });
      setTimeout(closeSnackbar, 1500);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      enqueueSnackbar(errorMsg(err), { variant: 'error' });
      setTimeout(closeSnackbar, 1500);
    }
  };

  return (
    <Layout title={product.name} description={product.description}>
      <div className={classes.section}>
        <NextLink href='/' passHref>
          <Link>
            <Typography>back to products</Typography>
          </Link>
        </NextLink>
      </div>
      <Grid container space={1}>
        <Grid item md={6} xs={12}>
          <Image
            src={product.image}
            alt={product.name}
            width={640}
            height={640}
            layout='responsive'
          />
        </Grid>
        <Grid item md={3} xs={12}>
          <List>
            <ListItem>
              <Typography component='h1' variant='h1'>
                {product.name}
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>Category: {product.category}</Typography>
            </ListItem>
            <ListItem>
              <Typography>Brand: {product.brand}</Typography>
            </ListItem>
            <ListItem>
              <Rating
                value={
                  reviews.reduce((a, c) => a + c.rating, 0) / reviews.length
                }
                readOnly
              />
              <Link href='#reviews'>
                <Typography>({reviews.length} reviews) </Typography>
              </Link>
            </ListItem>
            <ListItem>
              <Typography>Description: {product.description}</Typography>
            </ListItem>
          </List>
        </Grid>
        <Grid item md={3} xs={12}>
          <Card>
            <List>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>Price</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>$ {product.price}</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>Status</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      {product.countInStock > 0 ? 'In Stock' : 'Unavailable'}
                    </Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Button
                  onClick={addToCartHandler}
                  fullWidth
                  variant='contained'
                  color='primary'
                >
                  Add To Cart
                </Button>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
      <List>
        <ListItem>
          <Typography variant='h2' id='reviews' name='reviews'>
            Customer Reviews
          </Typography>
        </ListItem>
        {reviews.length === 0 && <ListItem>No Reviews</ListItem>}
        {reviews.map((review) => (
          <ListItem key={review._id}>
            <Grid container>
              <Grid item className={classes.reviewItem}>
                <Typography>
                  <strong>{review.name}</strong>
                </Typography>
                <Typography>{review.createdAt.substring(0, 10)}</Typography>
              </Grid>
              <Grid item>
                <Rating readOnly value={review.rating} />
                <Typography> {review.comment}</Typography>
              </Grid>
            </Grid>
          </ListItem>
        ))}
        <ListItem>
          {userInfo ? (
            <form onSubmit={submitHandler} className={classes.reviewForm}>
              <List>
                <ListItem>
                  <Typography variant='h2'>Leave your review</Typography>
                </ListItem>
                <ListItem>
                  <TextField
                    multiline
                    variant='outlined'
                    fullWidth
                    name='review'
                    label='Enter comment'
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </ListItem>
                <ListItem>
                  <Rating
                    name='simple-controlled'
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  />
                </ListItem>
                <ListItem>
                  <Button
                    type='submit'
                    fullWidth
                    variant='contained'
                    color='primary'
                  >
                    Submit
                  </Button>

                  {loading && <CircularProgress />}
                </ListItem>
              </List>
            </form>
          ) : (
            <Typography variant='h2'>
              Please{' '}
              <Link href={`/login?redirect=/product/${product.slug}`}>
                login
              </Link>{' '}
              to write a review
            </Typography>
          )}
        </ListItem>
      </List>
    </Layout>
  );
}

export async function getServerSideProps({ params }) {
  try {
    await db.connect();
    const product = await Product.findOne({ slug: params.slug }).lean();
    await db.disconnect();

    product.reviews = JSON.parse(JSON.stringify(product.reviews));

    return {
      props: {
        product: db.convertDocToObject(product),
      },
    };
  } catch (err) {
    return {
      props: {
        products: [],
      },
    };
  }
}
