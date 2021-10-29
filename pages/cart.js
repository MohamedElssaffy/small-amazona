import React, { useContext } from 'react';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';
import Image from 'next/image';
import {
  Button,
  Card,
  Grid,
  Link,
  List,
  ListItem,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import Layout from '../components/Layout';
import { Store } from '../utils/store';
import axios from 'axios';
import { useRouter } from 'next/router';

function CartPage() {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  const updateCartHandler = async (item, quantity) => {
    const { data } = await axios.get(`/api/products/${item._id}`);
    if (data.countInStock < quantity) {
      return window.alert(`Sorry, the product ${item.name} is out of stock`);
    }
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...item, quantity } });
  };
  const removeCartHandler = (id) => {
    dispatch({ type: 'CART_REMOVE_ITEM', payload: { id } });
  };

  const checkoutHandler = () => {
    router.push('/shipping');
  };

  return (
    <Layout title='Shopping Cart'>
      <Typography component='h1' variant='h1'>
        Shopping Cart
      </Typography>
      <Grid container spacing={2}>
        {cartItems.length === 0 ? (
          <Grid item xs={12}>
            <div>
              Cart is empty.{' '}
              <NextLink href='/' passHref>
                <Link>Go shopping</Link>
              </NextLink>
            </div>
          </Grid>
        ) : (
          <>
            <Grid item md={9} xs={12}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Image</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell align='right'>Quantity</TableCell>
                      <TableCell align='right'>Price</TableCell>
                      <TableCell align='right'>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cartItems.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          <NextLink href={`/product/${item.slug}`} passHref>
                            <Link>
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={50}
                                height={50}
                              />
                            </Link>
                          </NextLink>
                        </TableCell>
                        <TableCell>
                          <NextLink href={`/product/${item.slug}`} passHref>
                            <Link>
                              <Typography>{item.name}</Typography>
                            </Link>
                          </NextLink>
                        </TableCell>
                        <TableCell align='right'>
                          <Select
                            value={item.quantity}
                            onChange={(e) =>
                              updateCartHandler(item, e.target.value)
                            }
                          >
                            {[...Array(item.countInStock).keys()].map((v) => (
                              <MenuItem key={v + 1} value={v + 1}>
                                {' '}
                                {v + 1}
                              </MenuItem>
                            ))}
                          </Select>
                        </TableCell>
                        <TableCell align='right'>$ {item.price}</TableCell>
                        <TableCell align='right'>
                          <Button
                            onClick={() => removeCartHandler(item._id)}
                            variant='contained'
                            color='secondary'
                          >
                            x
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item md={3} xs={12}>
              <Card>
                <List>
                  <ListItem>
                    <Typography component='h2' variant='h2'>
                      Subtotal ({cartItems.reduce((a, c) => a + c.quantity, 0)}{' '}
                      Items) : $
                      {cartItems.reduce((a, c) => a + c.quantity * c.price, 0)}
                    </Typography>
                  </ListItem>
                  <ListItem>
                    <Button
                      onClick={checkoutHandler}
                      variant='contained'
                      color='primary'
                      fullWidth
                    >
                      Check Out
                    </Button>
                  </ListItem>
                </List>
              </Card>
            </Grid>
          </>
        )}
      </Grid>
    </Layout>
  );
}

export default dynamic(() => Promise.resolve(CartPage), { ssr: false });
