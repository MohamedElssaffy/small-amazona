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

export default function RegisterPge() {
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

  const onSubmitHandler = async ({
    name,
    email,
    password,
    confirmPassword,
  }) => {
    closeSnackbar();

    if (password !== confirmPassword) {
      return enqueueSnackbar("Password don't match", { variant: 'error' });
    }

    setLoading(true);
    try {
      const { data } = await axios.post('/api/users/register', {
        email,
        name,
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
    <Layout title='Register'>
      <form onSubmit={handleSubmit(onSubmitHandler)} className={classes.form}>
        <Typography component='h1' variant='h1'>
          Register
        </Typography>
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
            <Controller
              name='confirmPassword'
              control={control}
              defaultValue=''
              rules={{
                required: true,
                minLength: 6,
              }}
              render={({ field }) => (
                <TextField
                  label='Confirm Password'
                  id='confirmPassword'
                  fullWidth
                  variant='outlined'
                  inputProps={{ type: 'password', name: 'confirmPassword' }}
                  error={!!errors.confirmPassword}
                  helperText={
                    errors.confirmPassword
                      ? errors.confirmPassword.type === 'minLength'
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
              Register
            </Button>
          </ListItem>
          <ListItem>
            Already have an account?&nbsp;
            <NextLink
              href={`/login${redirect ? `?redirect=${redirect}` : ''}`}
              passHref
            >
              <Link>Login</Link>
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
