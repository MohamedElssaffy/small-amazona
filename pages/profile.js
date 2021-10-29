import {
  Button,
  Card,
  Grid,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@material-ui/core';
import axios from 'axios';
import { useRouter } from 'next/dist/client/router';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Layout from '../components/Layout';
import { errorMsg } from '../utils/error';
import { Store } from '../utils/store';
import useStyle from '../utils/styles';

function OrderHistory() {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const { userInfo } = state;
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm();

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const classes = useStyle();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userInfo) {
      return router.push('/login?redirect=profile');
    }

    setValue('name', userInfo.name);
    setValue('email', userInfo.email);
  }, []);

  const onSubmitHandler = async ({
    name,
    email,
    password,
    confirmPassword,
  }) => {
    closeSnackbar();

    setLoading(true);

    if (password) {
      if (password !== confirmPassword) {
        enqueueSnackbar('Password not match', { variant: 'error' });
        setLoading(false);
        return;
      }
    }
    try {
      const { data } = await axios.put(
        '/api/users/profile',
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
      dispatch({ type: 'USER_LOGIN', payload: data });
      enqueueSnackbar('Profile update successfully', { variant: 'success' });
      setLoading(false);
      setValue('password', '');
      setValue('confirmPassword', '');
    } catch (err) {
      enqueueSnackbar(errorMsg(err), { variant: 'error' });
      setLoading(false);
    }
  };

  return (
    <Layout title='Profile'>
      <Grid container spacing={1}>
        <Grid item md={3} xs={12}>
          <Card className={classes.section}>
            <List>
              <NextLink href='/profile' passHref>
                <ListItem selected button component='a'>
                  <ListItemText primary='User Profile' />
                </ListItem>
              </NextLink>
              <NextLink href='/order-history' passHref>
                <ListItem button component='a'>
                  <ListItemText primary='Order History' />
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
                  Profile
                </Typography>
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
                          minLength: 2,
                        }}
                        render={({ field }) => (
                          <TextField
                            label='Name'
                            id='name'
                            fullWidth
                            variant='outlined'
                            inputProps={{ type: 'text', name: 'name' }}
                            error={!!errors.name}
                            helperText={
                              errors.name
                                ? errors.name.type === 'minLength'
                                  ? 'Name length is more than 1'
                                  : 'Name is required'
                                : ''
                            }
                            {...field}
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <Controller
                        name='email'
                        control={control}
                        defaultValue=''
                        rules={{
                          required: true,
                          pattern: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
                        }}
                        render={({ field }) => (
                          <TextField
                            label='Email'
                            id='email'
                            fullWidth
                            variant='outlined'
                            inputProps={{ type: 'email', name: 'email' }}
                            error={!!errors.email}
                            helperText={
                              errors.email
                                ? errors.email.type === 'pattern'
                                  ? 'Invalid Email'
                                  : 'Email is required'
                                : ''
                            }
                            {...field}
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <Controller
                        name='password'
                        control={control}
                        defaultValue=''
                        rules={{
                          validate: (value) => value === '' || value.length > 5,
                        }}
                        render={({ field }) => (
                          <TextField
                            label='Password'
                            id='password'
                            fullWidth
                            variant='outlined'
                            inputProps={{ type: 'password', name: 'password' }}
                            error={!!errors.password}
                            helperText={
                              errors.password
                                ? 'Password Length is more than five'
                                : ''
                            }
                            {...field}
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <Controller
                        name='confirmPassword'
                        control={control}
                        defaultValue=''
                        rules={{
                          validate: (value) => value === '' || value.length > 5,
                        }}
                        render={({ field }) => (
                          <TextField
                            label='Confirm Password'
                            id='confirmPassword'
                            fullWidth
                            variant='outlined'
                            inputProps={{
                              type: 'password',
                              name: 'confirmPassword',
                            }}
                            error={!!errors.confirmPassword}
                            helperText={
                              errors.password
                                ? 'Confirm Password Length is more than five'
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

export default dynamic(() => Promise.resolve(OrderHistory), { ssr: false });
