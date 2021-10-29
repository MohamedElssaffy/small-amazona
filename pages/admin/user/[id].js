import {
  Button,
  Card,
  Checkbox,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  TextField,
  FormControlLabel,
  Typography,
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
      return { ...state, loading: false, user: action.payload, error: '' };
    case 'UPDATE_REQUEST':
      return { ...state, errorUpdate: '', loadingUpdate: true };

    case 'UPDATE_FALI':
      return { ...state, loadingUpdate: false, errorUpdate: action.payload };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false, errorUpdate: '' };

    default:
      return state;
  }
};

function EditUser({ params }) {
  const router = useRouter();
  const { state } = useContext(Store);
  const { userInfo } = state;
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm();

  const userId = params.id;

  const [{ loading, error, user, loadingUpdate }, dispatch] = useReducer(
    reducer,
    {
      loading: true,
      error: '',
      user: null,
      loadingUpdate: false,
    }
  );

  const [isAdmin, setIsAdmin] = useState(false);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const classes = useStyle();

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/users/${userId}`, {
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
    if (!user) {
      fetchData();
    }
    if (user) {
      setValue('name', user.name);
      setIsAdmin(user.isAdmin);
    }
  }, [user]);

  const onSubmitHandler = async ({ name }) => {
    closeSnackbar();

    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.put(
        `/api/admin/users/${userId}`,
        {
          name,
          isAdmin,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      dispatch({ type: 'UPDATE_SUCCESS' });
      enqueueSnackbar('User update successfully', { variant: 'success' });
      router.push('/admin/users');
    } catch (err) {
      dispatch({ type: 'UPDATE_FAIL' });
      enqueueSnackbar(errorMsg(err), { variant: 'error' });
    }
  };

  return (
    <Layout title={`Edit User ${userId}`}>
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
                <ListItem button component='a'>
                  <ListItemText primary='Products' />
                </ListItem>
              </NextLink>
              <NextLink href='/admin/users' passHref>
                <ListItem selected button component='a'>
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
                  Edit User {userId}
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
                      <FormControlLabel
                        label='Is Admin'
                        control={
                          <Checkbox
                            checked={isAdmin}
                            name='isAdmin'
                            onClick={(e) => setIsAdmin(e.target.checked)}
                          />
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <Button
                        color='primary'
                        variant='contained'
                        type='submit'
                        disabled={loadingUpdate}
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

export default dynamic(() => Promise.resolve(EditUser), { ssr: false });
