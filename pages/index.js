import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  Typography,
} from '@material-ui/core';
import { Rating } from '@material-ui/lab';
import axios from 'axios';
import NextLink from 'next/link';
import { useContext } from 'react';
import Layout from '../components/Layout';
import Product from '../models/Product';
import db from '../utils/db';
import { Store } from '../utils/store';

export default function Home({ products }) {
  const { state, dispatch } = useContext(Store);
  const addToCartHandler = async (product) => {
    const { data } = await axios.get(`/api/products/${product._id}`);

    const existItem = state.cart.cartItems.find(
      (item) => item._id === product._id
    );
    const quantity = existItem ? existItem.quantity + 1 : 1;
    if (!data || data.countInStock < quantity) {
      return window.alert(`The Product ${product.name} is out of stock`);
    }

    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });
  };
  return (
    <Layout>
      <h1>Products</h1>
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item key={product.name} md={4}>
            <Card>
              <NextLink href={`/product/${product.slug}`}>
                <CardActionArea>
                  <CardMedia
                    component='img'
                    image={product.image}
                    title={product.name}
                  />
                  <CardContent>
                    <Typography>{product.name}</Typography>
                    <Rating value={product.rating} readOnly />
                  </CardContent>
                </CardActionArea>
              </NextLink>
              <CardActions>
                <Typography>$ {product.price}</Typography>
                <Button
                  onClick={() => addToCartHandler(product)}
                  size='small'
                  color='primary'
                >
                  Add To Cart
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
}

export async function getServerSideProps() {
  try {
    await db.connect();
    let products = await Product.find({}).lean();
    await db.disconnect();
    products = products.map((product) => {
      product.reviews = JSON.parse(JSON.stringify(product.reviews));
      return product;
    });

    console.log({ products });
    return {
      props: {
        products: products.map(db.convertDocToObject),
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
