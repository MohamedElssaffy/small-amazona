import {
  Button,
  Card,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@material-ui/core';
import axios from 'axios';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect, useReducer } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Layout from '../../../components/Layout';
import { errorMsg } from '../../../utils/error';
import { Store } from '../../../utils/store';
import useStyle from '../../../utils/styles';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, error: '', loading: true };

    case 'FETCH_FALI':
      return { ...state, loading: false, error: action.payload };
    case 'FETCH_SUCCESS':
      return { loading: false, error: '' };

    default:
      return state;
  }
};

function EditProduct({ params }) {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm();

  const productId = params.id;

  const [{ loading, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const classes = useStyle();

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/products/${productId}`, {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        });

        dispatch({ type: 'FETCH_SUCCESS' });
        setValue('name', data.name);
        setValue('slug', data.slug);
        setValue('price', data.price);
        setValue('image', data.image);
        setValue('category', data.category);
        setValue('brand', data.brand);
        setValue('countInStock', data.countInStock);
        setValue('description', data.description);
      } catch (error) {
        dispatch({ type: 'FETCH_FAIL' });
        enqueueSnackbar(errorMsg(err), { variant: 'error' });
      }
    };
    fetchData();
  }, []);

  const onSubmitHandler = async ({
    name,
    slug,
    image,
    description,
    price,
    countInStock,
    brand,
    category,
  }) => {
    closeSnackbar();

    try {
      const { data } = await axios.put(
        `/api/admin/products/${productId}`,
        {
          email,
          name,
          password,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      enqueueSnackbar('Product update successfully', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(errorMsg(err), { variant: 'error' });
    }
  };

  return (
    <Layout title={`Edit Product ${productId}`}>
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
            </List>
          </Card>
        </Grid>
        <Grid item md={9} xs={12}>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography component='h1' variant='h1'>
                  Edit Product {productId}
                </Typography>
              </ListItem>
              <ListItem>
                {loading && <CircularProgress />}
                {error && (
                  <Typography className={classes.error}>{error}</Typography>
                )}
              </ListItem>
              <ListItem>
                <form
                  onSubmit={handleSubmit(onSubmitHandler)}
                  className={classes.form}
                >
                  <List>
                    <ListItem>
                      <Controller
                        name='name'
                        control={control}
                        defaultValue=''
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            label='Name'
                            id='name'
                            fullWidth
                            variant='outlined'
                            error={!!errors.name}
                            helperText={errors.name ? 'Name is required' : ''}
                            {...field}
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <Controller
                        name='slug'
                        control={control}
                        defaultValue=''
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            label='Slug'
                            id='slug'
                            fullWidth
                            variant='outlined'
                            error={!!errors.slug}
                            helperText={errors.slug ? 'Slug is required' : ''}
                            {...field}
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <Controller
                        name='price'
                        control={control}
                        defaultValue=''
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            label='Price'
                            id='price'
                            fullWidth
                            variant='outlined'
                            inputProps={{ type: 'number' }}
                            error={!!errors.price}
                            helperText={errors.price ? 'Price is required' : ''}
                            {...field}
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <Controller
                        name='image'
                        control={control}
                        defaultValue=''
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            label='Image'
                            id='image'
                            fullWidth
                            variant='outlined'
                            error={!!errors.image}
                            helperText={errors.image ? 'Image is required' : ''}
                            {...field}
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <Controller
                        name='category'
                        control={control}
                        defaultValue=''
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            label='Category'
                            id='category'
                            fullWidth
                            variant='outlined'
                            error={!!errors.category}
                            helperText={
                              errors.category ? 'Category is required' : ''
                            }
                            {...field}
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <Controller
                        name='brand'
                        control={control}
                        defaultValue=''
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            label='Brand'
                            id='brand'
                            fullWidth
                            variant='outlined'
                            inputProps={{ type: 'text', name: 'brand' }}
                            error={!!errors.brand}
                            helperText={errors.brand ? 'Brand is required' : ''}
                            {...field}
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <Controller
                        name='countInStock'
                        control={control}
                        defaultValue=''
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            label='count In Stock'
                            id='countInStock'
                            fullWidth
                            variant='outlined'
                            inputProps={{
                              type: 'number',
                              name: 'countInStock',
                            }}
                            error={!!errors.countInStock}
                            helperText={
                              errors.countInStock
                                ? 'Count In Stock is required'
                                : ''
                            }
                            {...field}
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <Controller
                        name='description'
                        control={control}
                        defaultValue=''
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            label='Description'
                            id='description'
                            fullWidth
                            multiline
                            variant='outlined'
                            error={!!errors.description}
                            helperText={
                              errors.description
                                ? 'Description is required'
                                : ''
                            }
                            {...field}
                          />
                        )}
                      />
                    </ListItem>

                    <ListItem>
                      <Button
                        color='primary'
                        variant='contained'
                        type='submit'
                        disabled={loading}
                        fullWidth
                      >
                        Update
                      </Button>
                    </ListItem>
                  </List>
                </form>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
}

export const getServerSideProps = ({ params, req }) => {
  const { userInfo } = req.cookies;
  if (!userInfo) {
    return {
      redirect: {
        destination: '/login',
        permenant: false,
      },
    };
  }
  if (userInfo) {
    if (!JSON.parse(userInfo).isAdmin) {
      return {
        redirect: {
          destination: '/',
          permenant: false,
        },
      };
    }
  }

  return {
    props: {
      params,
    },
  };
};

export default dynamic(() => Promise.resolve(EditProduct), { ssr: false });
