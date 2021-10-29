import {
  Card,
  CircularProgress,
  Grid,
  Link,
  List,
  ListItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  Button,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import { usePayPalScriptReducer, PayPalButtons } from '@paypal/react-paypal-js';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect, useReducer } from 'react';
import CheckoutWizard from '../../components/CheckoutWizard';
import Layout from '../../components/Layout';
import { errorMsg } from '../../utils/error';
import { Store } from '../../utils/store';
import useStyle from '../../utils/styles';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, error: '', loading: true };

    case 'FETCH_FALI':
      return { ...state, loading: false, error: action.payload };
    case 'FETCH_SUCCESS':
      return { loading: false, order: action.payload, error: '' };
    case 'PAY_REQUEST':
      return { ...state, payLoading: true };

    case 'PAY_FALI':
      return { ...state, payLoading: false, payError: action.payload };
    case 'PAY_SUCCESS':
      return { ...state, payLoading: false, paySuccess: action.payload };
    case 'PAY_RESET':
      return { ...state, payLoading: false, paySuccess: false, payError: '' };
    case 'DELIVERED_REQUEST':
      return { ...state, deliveredLoading: true };

    case 'DELIVERED_FALI':
      return {
        ...state,
        deliveredLoading: false,
        deliveredError: action.payload,
      };
    case 'DELIVERED_SUCCESS':
      return {
        ...state,
        deliveredLoading: false,
        deliveredSuccess: action.payload,
      };
    case 'DELIVERED_RESET':
      return {
        ...state,
        deliveredLoading: false,
        deliveredSuccess: false,
        deliveredError: '',
      };

    default:
      return state;
  }
};

function OrderPage({ params }) {
  const router = useRouter();
  const { state } = useContext(Store);
  const { userInfo } = state;
  const classes = useStyle();
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
  const [
    { order, paySuccess, deliveredSuccess, deliveredLoading, loading, error },
    dispatch,
  ] = useReducer(reducer, {
    order: {},
    loading: true,
    error: '',
    paySuccess: false,
    payError: '',
    payLoading: false,
    deliveredLoading: false,
    deliveredSuccess: false,
  });

  const {
    shippingAddress,
    shippingPrice,
    totalPrice,
    taxPrice,
    paymentMethod,
    itemsPrice,
    orderItems,
    isDelivered,
    isPaid,
    deliveredAt,
    paidAt,
  } = order;

  const { closeSnackbar, enqueueSnackbar } = useSnackbar();
  const orderId = params.id;
  useEffect(() => {
    if (!userInfo) {
      router.push('/login');
    }

    const fetchOrder = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });

        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: errorMsg(err) });
      }
    };

    if (
      !order._id ||
      paySuccess ||
      deliveredSuccess ||
      (order._id && order._id !== orderId)
    ) {
      fetchOrder();
      if (paySuccess) {
        dispatch({ type: 'PAY_RESET' });
      }

      if (deliveredSuccess) {
        dispatch({ type: 'DELIVERED_RESET' });
      }
    } else {
      const loadPaypalScript = async () => {
        const { data: clientId } = await axios.get('/api/keys/paypal', {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        paypalDispatch({
          type: 'resetOptions',
          value: { 'client-id': clientId, currency: 'USD' },
        });
        paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
      };
      loadPaypalScript();
    }
  }, [order, paySuccess, deliveredSuccess]);

  const createOrder = (data, actions) => {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: { value: totalPrice },
          },
        ],
      })
      .then((orderID) => orderID);
  };

  const onApprove = (data, actions) => {
    return actions.order.capture().then(async (details) => {
      try {
        dispatch({ type: 'PAY_REQUEST' });

        const { data } = await axios.put(
          `/api/orders/${order._id}/pay`,
          details,
          { headers: { authorization: `Bearer ${userInfo.token}` } }
        );

        dispatch({ type: 'PAY_SUCCESS', payload: data });
        enqueueSnackbar('Order is paid', { variant: 'success' });
      } catch (err) {
        dispatch({ type: 'PAY_FALI', payload: errorMsg(err) });
        enqueueSnackbar(errorMsg(err), { variant: 'error' });
      }
    });
  };

  const onError = (err) => {
    enqueueSnackbar(errorMsg(err), { variant: 'error' });
  };

  const deliveredHandler = async () => {
    try {
      dispatch({ type: 'DELIVERED_REQUEST' });

      const { data } = await axios.put(
        `/api/admin/orders/${order._id}/delivered`,
        {},
        { headers: { authorization: `Bearer ${userInfo.token}` } }
      );

      dispatch({ type: 'DELIVERED_SUCCESS', payload: data });
      enqueueSnackbar('Order is delivered', { variant: 'success' });
    } catch (err) {
      dispatch({ type: 'DELIVERED_FALI', payload: errorMsg(err) });
      enqueueSnackbar(errorMsg(err), { variant: 'error' });
    }
  };

  return (
    <Layout title={`Order ${orderId}`}>
      <Typography component='h1' variant='h1'>
        Order {orderId}
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography className={classes.error}>{error}</Typography>
      ) : (
        <Grid container spacing={2}>
          <Grid item md={9} xs={12}>
            <Card className={classes.section}>
              <List>
                <ListItem>
                  <Typography component='h2' vartiant='h2'>
                    Shipping Address
                  </Typography>
                </ListItem>
                <ListItem>
                  {shippingAddress.fullName}, {shippingAddress.address},{' '}
                  {shippingAddress.city}, {shippingAddress.postalCode},{' '}
                  {shippingAddress.country}
                </ListItem>
                <ListItem>
                  Status:{' '}
                  {isDelivered
                    ? `delivered at ${deliveredAt}`
                    : 'not delivered'}
                </ListItem>
              </List>
            </Card>
            <Card className={classes.section}>
              <List>
                <ListItem>
                  <Typography component='h2' vartiant='h2'>
                    Payment Method
                  </Typography>
                </ListItem>
                <ListItem>{paymentMethod}</ListItem>
                <ListItem>
                  Status:{' '}
                  {isPaid
                    ? `paid at ${new Date(paidAt).toLocaleString('en-US')}`
                    : 'not paid'}
                </ListItem>
              </List>
            </Card>
            <Card className={classes.section}>
              <List>
                <ListItem>
                  <Typography component='h2' variant='h2'>
                    Order Items
                  </Typography>
                </ListItem>
                <ListItem>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Image</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell align='right'>Quantity</TableCell>
                          <TableCell align='right'>Price</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orderItems.map((item) => (
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
                              <Typography>{item.quantity}</Typography>
                            </TableCell>
                            <TableCell align='right'>
                              <Typography>$ {item.price}</Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </ListItem>
              </List>
            </Card>
          </Grid>
          <Grid item md={3} xs={12}>
            <Card className={classes.section}>
              <List>
                <ListItem>
                  <Typography component='h2' variant='h2'>
                    Order Summary
                  </Typography>
                </ListItem>
                <ListItem>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography>Items:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography align='right'>$ {itemsPrice}</Typography>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography>Tax:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography align='right'>$ {taxPrice}</Typography>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography>Shipping:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography align='right'>$ {shippingPrice}</Typography>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography>
                        <strong>Total:</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography align='right'>
                        <strong>$ {totalPrice}</strong>
                      </Typography>
                    </Grid>
                  </Grid>
                </ListItem>

                {!isPaid && (
                  <ListItem>
                    {isPending ? (
                      <CircularProgress />
                    ) : (
                      <PayPalButtons
                        className={classes.fullWidth}
                        createOrder={createOrder}
                        onError={onError}
                        onApprove={onApprove}
                      ></PayPalButtons>
                    )}
                  </ListItem>
                )}
                {userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                  <ListItem>
                    {deliveredLoading && <CircularProgress />}
                    <Button
                      variant='contained'
                      color='primary'
                      fullWidth
                      onClick={deliveredHandler}
                    >
                      Delivered Order
                    </Button>
                  </ListItem>
                )}
              </List>
            </Card>
          </Grid>
        </Grid>
      )}
    </Layout>
  );
}

export const getServerSideProps = async ({ params }) => {
  return { props: { params } };
};

export default dynamic(() => Promise.resolve(OrderPage), { ssr: false });
