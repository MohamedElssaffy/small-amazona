import {
  Button,
  Link,
  List,
  ListItem,
  TextField,
  Typography,
} from '@material-ui/core';
import axios from 'axios';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React, { useContext, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Layout from '../components/Layout';
import { Store } from '../utils/store';
import useStyle from '../utils/styles';

export default function LoginPge() {
  const router = useRouter();
  const { dispatch } = useContext(Store);
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const { redirect } = router.query;

  const classes = useStyle();

  const onSubmitHandler = async ({ email, password }) => {
    closeSnackbar();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/users/login', {
        email,
        password,
      });
      dispatch({ type: 'USER_LOGIN', payload: data });
      router.push(redirect || '/');
    } catch (err) {
      enqueueSnackbar(
        err.response?.data ? err.response.data.message : err.message,
        { variant: 'error' }
      );
      setLoading(false);
    }
  };

  return (
    <Layout title='Login'>
      <form onSubmit={handleSubmit(onSubmitHandler)} className={classes.form}>
        <Typography component='h1' variant='h1'>
          Login
        </Typography>
        <List>
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
                required: true,
                minLength: 6,
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
                      ? errors.password.type === 'minLength'
                        ? 'Password Length is more than five'
                        : 'Password is required'
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
              Login
            </Button>
          </ListItem>
          <ListItem>
            Don&apos;t have an account?&nbsp;
            <NextLink
              href={`/register${redirect ? `?redirect=${redirect}` : ''}`}
              passHref
            >
              <Link>Register</Link>
            </NextLink>
          </ListItem>
        </List>
      </form>
    </Layout>
  );
}

export const getServerSideProps = ({ req }) => {
  const { userInfo } = req.cookies;
  if (userInfo) {
    return {
      redirect: {
        destination: '/',
        permenant: false,
      },
    };
  }
  return {
    props: {},
  };
};
