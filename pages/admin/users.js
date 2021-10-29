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
      return { loading: false, users: action.payload, error: '' };
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

function AdminUsers() {
  const router = useRouter();
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [{ users, loading, loadingDelete, error }, dispatch] = useReducer(
    reducer,
    {
      users: [],
      loading: true,
      loadingDelete: false,
      error: '',
    }
  );

  const { closeSnackbar, enqueueSnackbar } = useSnackbar();

  const classes = useStyle();

  const fetchData = async () => {
    try {
      dispatch({ type: 'FETCH_REQUEST' });
      const { data } = await axios.get(`/api/admin/users`, {
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

  const deleteHandler = async (userId) => {
    if (!window.confirm('Are you sure, Delete User')) {
      return;
    }
    closeSnackbar();

    try {
      dispatch({ type: 'DELETE_REQUEST' });

      await axios.delete(
        `/api/admin/users/${userId}`,

        { headers: { authorization: `Bearer ${userInfo.token}` } }
      );

      dispatch({ type: 'DELETE_SUCCESS' });
      enqueueSnackbar('User DELETED Successfully', { variant: 'success' });
      setTimeout(closeSnackbar, 1500);
      await fetchData();
    } catch (err) {
      dispatch({ type: 'DELETE_FAIL' });
      enqueueSnackbar(errorMsg(err), { variant: 'error' });
      setTimeout(closeSnackbar, 1500);
    }
  };

  return (
    <Layout title='Admin Users'>
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
                  Users
                </Typography>
                {loadingDelete && <CircularProgress />}
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
                          <TableCell>EMAIL</TableCell>
                          <TableCell>ISADMIN</TableCell>
                          <TableCell>ACTIONS</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user._id}>
                            <TableCell>{user._id.substring(20, 24)}</TableCell>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.isAdmin ? 'YES' : 'NO'}</TableCell>
                            <TableCell>
                              <NextLink
                                href={`/admin/user/${user._id}`}
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
                                onClick={() => deleteHandler(user._id)}
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

export default dynamic(() => Promise.resolve(AdminUsers), { ssr: false });
