import {
  Button,
  Card,
  CircularProgress,
  FormControlLabel,
  Grid,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  Checkbox,
} from '@material-ui/core';

import axios from 'axios';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect, useReducer, useState } from 'react';
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
      return { ...state, loading: false, product: action.payload, error: '' };
    case 'UPDATE_REQUEST':
      return { ...state, errorUpdate: '', loadingUpdate: true };

    case 'UPDATE_FALI':
      return { ...state, loadingUpdate: false, errorUpdate: action.payload };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false, errorUpdate: '' };

    case 'UPLOAD_REQUEST_IMAGE':
      return { ...state, errorUpload: '', loadingUpload: true };
    case 'UPLOAD_REQUEST_FEATURED_IMAGE':
      return { ...state, errorUpload: '', loadingUploadFeatured: true };

    case 'UPLOAD_FALI_IMAGE':
      return { ...state, loadingUpload: false, errorUpload: action.payload };
    case 'UPLOAD_FALI_FEATURED_IMAGE':
      return {
        ...state,
        loadingUploadFeatured: false,
        errorUpload: action.payload,
      };
    case 'UPLOAD_SUCCESS_IMAGE':
      return {
        ...state,
        loadingUpload: false,
        errorUpload: '',
        image: action.payload,
      };
    case 'UPLOAD_SUCCESS_FEATURED_IMAGE':
      return {
        ...state,
        loadingUploadFeatured: false,
        errorUpload: '',
        featuredImage: action.payload,
      };

    default:
      return state;
  }
};

function EditProduct({ params }) {
  const router = useRouter();
  const { state } = useContext(Store);
  const { userInfo } = state;
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm();

  const productId = params.id;

  const [
    {
      loading,
      error,
      product,
      loadingUpdate,
      image,
      featuredImage,
      loadingUpload,
      loadingUploadFeatured,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
    product: null,
    loadingUpdate: false,
    loadingUpload: false,
    loadingUploadFeatured: false,
  });

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const classes = useStyle();
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/products/${productId}`, {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        });

        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL' });
        enqueueSnackbar(errorMsg(err), { variant: 'error' });
      }
    };
    if (!product) {
      fetchData();
    }
    if (product) {
      console.log(product.isFeatured);
      setValue('name', product.name);
      setValue('price', product.price);
      setIsFeatured(product.isFeatured);
      setValue('category', product.category);
      setValue('brand', product.brand);
      setValue('countInStock', product.countInStock);
      setValue('description', product.description);
    }
  }, [product]);

  const onSubmitHandler = async ({
    name,
    description,
    price,
    countInStock,
    brand,
    category,
  }) => {
    closeSnackbar();

    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.put(
        `/api/admin/products/${productId}`,
        {
          name,
          description,
          image,
          isFeatured,
          featuredImage,
          price,
          countInStock,
          brand,
          category,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      dispatch({ type: 'UPDATE_SUCCESS' });
      enqueueSnackbar('Product update successfully', { variant: 'success' });
      router.push('/admin/products');
    } catch (err) {
      dispatch({ type: 'UPDATE_FAIL' });
      enqueueSnackbar(errorMsg(err), { variant: 'error' });
    }
  };

  const uploadHandler = async (e, imageField = 'IMAGE') => {
    closeSnackbar();

    const file = e.target.files[0];
    const formDataBody = new FormData();
    formDataBody.append('file', file);

    try {
      dispatch({ type: `UPLOAD_REQUEST_${imageField}` });
      const { data } = await axios.post(
        `/api/admin/upload`,

        formDataBody,

        {
          headers: {
            'Content-Type': 'multipart/form-data',
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      dispatch({
        type: `UPLOAD_SUCCESS_${imageField}`,
        payload: data.secure_url,
      });
      enqueueSnackbar('Upload image successfully', { variant: 'success' });
    } catch (err) {
      dispatch({ type: `UPLOAD_FAIL_${imageField}` });
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
                      <Button variant='contained' component='label'>
                        Upload Image
                        <input
                          type='file'
                          onChange={uploadHandler}
                          accept='image/png, image/gif, image/jpeg'
                          hidden
                        />
                      </Button>
                      {loadingUpload && <CircularProgress />}
                    </ListItem>
                    <ListItem>
                      <FormControlLabel
                        label='Is Featured'
                        control={
                          <Checkbox
                            checked={isFeatured}
                            name='isFeatured'
                            onClick={(e) => setIsFeatured(e.target.checked)}
                          />
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <Button
                        disabled={!isFeatured}
                        variant='contained'
                        component='label'
                      >
                        Upload Featured Image
                        <input
                          type='file'
                          onChange={(e) => uploadHandler(e, 'FEATURED_IMAGE')}
                          accept='image/png, image/gif, image/jpeg'
                          hidden
                        />
                      </Button>
                      {loadingUploadFeatured && <CircularProgress />}
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
                        disabled={
                          loadingUpdate ||
                          loadingUpload ||
                          loadingUploadFeatured
                        }
                        fullWidth
                      >
                        Update
                      </Button>
                      {loadingUpdate && <CircularProgress />}
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
