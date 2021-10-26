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
import React, { useContext, useState } from 'react';
import Layout from '../components/Layout';
import { Store } from '../utils/store';
import useStyle from '../utils/styles';

export default function LoginPge() {
  const router = useRouter();
  const { dispatch } = useContext(Store);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { redirect } = router.query;

  const classes = useStyle();

  const onSubmitHandler = async (e) => {
    console.log('add');
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/users/login', {
        email,
        password,
      });
      dispatch({ type: 'USER_LOGIN', payload: data });
      router.push(redirect || '/');
    } catch (err) {
      alert(err.response?.data ? err.response.data.message : err.message);
      setLoading(false);
    }
  };

  return (
    <Layout title='Login'>
      <form onSubmit={onSubmitHandler} className={classes.form}>
        <Typography component='h1' variant='h1'>
          Login
        </Typography>
        <List>
          <ListItem>
            <TextField
              label='Email'
              id='email'
              fullWidth
              variant='outlined'
              inputProps={{ type: 'email', name: 'email' }}
              onChange={(e) => setEmail(e.target.value)}
              value={email || ''}
            />
          </ListItem>
          <ListItem>
            <TextField
              label='Password'
              id='password'
              fullWidth
              variant='outlined'
              inputProps={{ type: 'password', name: 'password' }}
              onChange={(e) => setPassword(e.target.value)}
              value={password || ''}
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
            <NextLink href='/register' passHref>
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
