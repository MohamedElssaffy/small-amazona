/* eslint-disable @next/next/no-img-element */
import { Grid, Link, Typography } from '@material-ui/core';
import axios from 'axios';
import NextLink from 'next/link';
import { useContext } from 'react';
import Carousel from 'react-material-ui-carousel';
import Layout from '../components/Layout';
import ProductItem from '../components/ProductItem';
import Product from '../models/Product';
import db from '../utils/db';
import { Store } from '../utils/store';
import useStyle from '../utils/styles';

export default function Home({ topRatedProducts, featuredProducts }) {
  const { state, dispatch } = useContext(Store);
  const classes = useStyle();
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
      <Carousel className={classes.carousel} animation='slide'>
        {featuredProducts.map((product) => (
          <NextLink
            key={product._id}
            href={`/product/${product.slug}`}
            passHref
          >
            <Link>
              <img
                src={product.featuredImage}
                alt={product.name}
                className={classes.featuredImage}
              />
            </Link>
          </NextLink>
        ))}
      </Carousel>
      <Typography variant='h2'>Popular Products</Typography>
      <Grid container spacing={3}>
        {topRatedProducts.map((product) => (
          <Grid item key={product.name} md={4}>
            <ProductItem
              product={product}
              addToCartHandler={addToCartHandler}
            />
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
}

export async function getServerSideProps() {
  try {
    await db.connect();
    let topRatedProducts = await Product.find({})
      .sort({ rating: -1 })
      .limit(6)
      .lean();
    const featuredProducts = await Product.find(
      { isFeatured: true },
      '-reviews'
    )
      .limit(3)
      .lean();
    await db.disconnect();
    topRatedProducts = topRatedProducts.map((product) => {
      product.reviews = JSON.parse(JSON.stringify(product.reviews));
      return product;
    });

    return {
      props: {
        topRatedProducts: topRatedProducts.map(db.convertDocToObject),
        featuredProducts: featuredProducts.map(db.convertDocToObject),
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
