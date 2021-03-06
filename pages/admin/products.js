import {
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { useRouter } from 'next/dist/client/router';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';
import React, { useContext, useEffect, useReducer } from 'react';
import Layout from '../../components/Layout';
import { errorMsg } from '../../utils/error';
import { Store } from '../../utils/store';
import useStyle from '../../utils/styles';
import { useSnackbar } from 'notistack';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, error: '', loading: true };

    case 'FETCH_FALI':
      return { ...state, loading: false, error: action.payload };
    case 'FETCH_SUCCESS':
      return { loading: false, products: action.payload, error: '' };
    case 'CREATE_REQUEST':
      return { ...state, error: '', loadingCreate: true };

    case 'CREATE_FALI':
      return { ...state, loadingCreate: false };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreate: false };
    case 'DELETE_REQUEST':
      return { ...state, error: '', loadingDelete: true };

    case 'DELETE_FALI':
      return { ...state, loadingDelete: false };
    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false };

    default:
      return state;
  }
};

function AdminProducts() {
  const router = useRouter();
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [{ products, loading, loadingCreate, loadingDelete, error }, dispatch] =
    useReducer(reducer, {
      products: [],
      loading: true,
      loadingCreate: false,
      loadingDelete: false,
      error: '',
    });

  const { closeSnackbar, enqueueSnackbar } = useSnackbar();

  const classes = useStyle();

  const fetchData = async () => {
    try {
      dispatch({ type: 'FETCH_REQUEST' });
      const { data } = await axios.get(`/api/admin/products`, {
        headers: { authorization: `Bearer ${userInfo.token}` },
      });
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (err) {
      dispatch({ type: 'FETCH_FAIL', payload: errorMsg(err) });
    }
  };

  useEffect(() => {
    if (!userInfo) {
      router.push('/login');
    }

    fetchData();
  }, []);

  const createHandler = async () => {
    if (!window.confirm('Create Product')) {
      return;
    }
    closeSnackbar();

    try {
      dispatch({ type: 'CREATE_REQUEST' });

      const { data } = await axios.post(
        '/api/admin/products',
        {},
        { headers: { authorization: `Bearer ${userInfo.token}` } }
      );

      dispatch({ type: 'CREATE_SUCCESS' });
      enqueueSnackbar('Product Created', { variant: 'success' });
      router.push(`/admin/product/${data._id}`);
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' });
      enqueueSnackbar(errorMsg(err), { variant: 'error' });
    }
  };
  const deleteHandler = async (productId) => {
    if (!window.confirm('Are you sure, Delete Product')) {
      return;
    }
    closeSnackbar();

    try {
      dispatch({ type: 'DELETE_REQUEST' });

      await axios.delete(
        `/api/admin/products/${productId}`,

        { headers: { authorization: `Bearer ${userInfo.token}` } }
      );

      dispatch({ type: 'DELETE_SUCCESS' });
      enqueueSnackbar('Product DELETED Successfully', { variant: 'success' });
      setTimeout(closeSnackbar, 1500);
      await fetchData();
    } catch (err) {
      dispatch({ type: 'DELETE_FAIL' });
      enqueueSnackbar(errorMsg(err), { variant: 'error' });
      setTimeout(closeSnackbar, 1500);
    }
  };

  return (
    <Layout title='Admin Products'>
      <Grid container spacing={1}>
        <Grid item md={3} xs={12}>
          <Card className={classes.section}>
            <List>
              <NextLink href='/admin/dashboard' passHref>
                <ListItem button component='a'>
                  <ListItemText primary='Admin Dashboard' />
                </ListItem>
              </NextLink>
              <NextLink href='/admin/orders' passHref>
                <ListItem button component='a'>
                  <ListItemText primary='Orders' />
                </ListItem>
              </NextLink>
              <NextLink href='/admin/products' passHref>
                <ListItem selected button component='a'>
                  <ListItemText primary='Products' />
                </ListItem>
              </NextLink>
              <NextLink href='/admin/users' passHref>
                <ListItem button component='a'>
                  <ListItemText primary='Users' />
                </ListItem>
              </NextLink>
            </List>
          </Card>
        </Grid>
        <Grid item md={9} xs={12}>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Grid container alignItems='center'>
                  <Grid item xs={6}>
                    <Typography component='h1' variant='h1'>
                      Products
                    </Typography>
                    {loadingDelete && <CircularProgress />}
                  </Grid>
                  <Grid item xs={6} align='right'>
                    <Button
                      variant='contained'
                      color='primary'
                      onClick={createHandler}
                      disabled={loadingCreate}
                    >
                      Create Product
                    </Button>
                    {loadingCreate && <CircularProgress />}
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                {loading ? (
                  <CircularProgress />
                ) : error ? (
                  <Typography className={classes.error}>{error}</Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>NAME</TableCell>
                          <TableCell>PRICE</TableCell>
                          <TableCell>COUNT</TableCell>
                          <TableCell>CATEGORY</TableCell>
                          <TableCell>RATING</TableCell>
                          <TableCell>ACTIONS</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product._id}>
                            <TableCell>
                              {product._id.substring(20, 24)}
                            </TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>$ {product.price}</TableCell>
                            <TableCell>{product.countInStock}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>{product.rating}</TableCell>
                            <TableCell>
                              <NextLink
                                href={`/admin/product/${product._id}`}
                                passHref
                              >
                                <Button
                                  size='small'
                                  color='secondary'
                                  variant='contained'
                                >
                                  Edit
                                </Button>
                              </NextLink>
                              <Button
                                onClick={() => deleteHandler(product._id)}
                                size='small'
                                variant='contained'
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
}

export default dynamic(() => Promise.resolve(AdminProducts), { ssr: false });
