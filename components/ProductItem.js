import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
} from '@material-ui/core';
import { Rating } from '@material-ui/lab';
import NextLink from 'next/link';
import React from 'react';

export default function ProductItem({ product, addToCartHandler }) {
  return (
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
  );
}
