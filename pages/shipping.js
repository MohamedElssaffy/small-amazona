import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Controller, useForm } from 'react-hook-form';
import Layout from '../components/Layout';
import { Store } from '../utils/store';
import useStyle from '../utils/styles';
import {
  Button,
  List,
  ListItem,
  TextField,
  Typography,
} from '@material-ui/core';
import CheckoutWizard from '../components/CheckoutWizard';

export default function ShippingPage() {
  const router = useRouter();
  const { dispatch, state } = useContext(Store);
  const {
    userInfo,
    cart: { shippingAddress },
  } = state;
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm();
  useEffect(() => {
    if (!userInfo) {
      router.push('/login?redirect=/shipping');
    }

    setValue('fullName', shippingAddress.fullName);
    setValue('city', shippingAddress.city);
    setValue('address', shippingAddress.address);
    setValue('postalCode', shippingAddress.postalCode);
    setValue('country', shippingAddress.country);
  }, []);

  const classes = useStyle();

  const onSubmitHandler = async ({
    fullName,
    postalCode,
    city,
    address,
    country,
  }) => {
    dispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: {
        fullName,
        postalCode,
        city,
        address,
        country,
      },
    });
    router.push('/payment');
  };

  return (
    <Layout title='Shipping Address'>
      <CheckoutWizard activeStep={1} />
      <form onSubmit={handleSubmit(onSubmitHandler)} className={classes.form}>
        <Typography component='h1' variant='h1'>
          Shipping Address
        </Typography>
        <List>
          <ListItem>
            <Controller
              name='fullName'
              control={control}
              defaultValue=''
              rules={{
                required: true,
                minLength: 2,
              }}
              render={({ field }) => (
                <TextField
                  label='Full Name'
                  id='fullName'
                  fullWidth
                  variant='outlined'
                  inputProps={{ type: 'text', name: 'fullName' }}
                  error={!!errors.fullName}
                  helperText={
                    errors.fullName
                      ? errors.fullName.type === 'minLength'
                        ? 'Full Name length is more than 1'
                        : 'Full Name is required'
                      : ''
                  }
                  {...field}
                />
              )}
            />
          </ListItem>
          <ListItem>
            <Controller
              name='country'
              control={control}
              defaultValue=''
              rules={{
                required: true,
                minLength: 4,
              }}
              render={({ field }) => (
                <TextField
                  label='Country'
                  id='country'
                  fullWidth
                  variant='outlined'
                  inputProps={{ type: 'text', name: 'country' }}
                  error={!!errors.country}
                  helperText={
                    errors.country
                      ? errors.country.type === 'minLength'
                        ? 'Country is more than 4'
                        : 'Country is required'
                      : ''
                  }
                  {...field}
                />
              )}
            />
          </ListItem>
          <ListItem>
            <Controller
              name='city'
              control={control}
              defaultValue=''
              rules={{
                required: true,
                minLength: 4,
              }}
              render={({ field }) => (
                <TextField
                  label='City'
                  id='city'
                  fullWidth
                  variant='outlined'
                  inputProps={{ type: 'text', name: 'city' }}
                  error={!!errors.city}
                  helperText={
                    errors.city
                      ? errors.city.type === 'minLength'
                        ? 'City is more than 4'
                        : 'City is required'
                      : ''
                  }
                  {...field}
                />
              )}
            />
          </ListItem>
          <ListItem>
            <Controller
              name='address'
              control={control}
              defaultValue=''
              rules={{
                required: true,
                minLength: 2,
              }}
              render={({ field }) => (
                <TextField
                  label='Address'
                  id='address'
                  fullWidth
                  variant='outlined'
                  inputProps={{ type: 'text', name: 'address' }}
                  error={!!errors.address}
                  helperText={
                    errors.address
                      ? errors.address.type === 'minLength'
                        ? 'Address Length is more 1'
                        : 'Address is required'
                      : ''
                  }
                  {...field}
                />
              )}
            />
          </ListItem>
          <ListItem>
            <Controller
              name='postalCode'
              control={control}
              defaultValue=''
              rules={{
                required: true,
                minLength: 5,
              }}
              render={({ field }) => (
                <TextField
                  label='Postal Code'
                  id='postalCode'
                  fullWidth
                  variant='outlined'
                  inputProps={{ type: 'text', name: 'postalCode' }}
                  error={!!errors.postalCode}
                  helperText={
                    errors.postalCode
                      ? errors.postalCode.type === 'minLength'
                        ? 'Postal Code Length is more 4'
                        : 'Postal Code is required'
                      : ''
                  }
                  {...field}
                />
              )}
            />
          </ListItem>
          <ListItem>
            <Button color='primary' variant='contained' type='submit' fullWidth>
              Continue
            </Button>
          </ListItem>
        </List>
      </form>
    </Layout>
  );
}
