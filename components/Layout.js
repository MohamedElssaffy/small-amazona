import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  createTheme,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  Link,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Switch,
  ThemeProvider,
  Toolbar,
  Typography,
} from '@material-ui/core';
import CancelIcon from '@material-ui/icons/Cancel';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import axios from 'axios';
import Cookies from 'js-cookie';
import Head from 'next/head';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React, { Fragment, useContext, useEffect, useState } from 'react';
import { errorMsg } from '../utils/error';
import { Store } from '../utils/store';
import useStyle from '../utils/styles';

export default function Layout({ children, title, description }) {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const { darkMode, cart, userInfo } = state;

  const [sidebarVisibel, setSidebarVisibel] = useState(false);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState('');

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const classes = useStyle();

  const theme = createTheme({
    typography: {
      h1: {
        fontSize: '1.6rem',
        fontWeight: '400',
        margin: '1rem 0',
      },
      h2: {
        fontSize: '1.4rem',
        fontWeight: '400',
        margin: '1rem 0',
      },
      body1: {
        fontWeight: 'normal',
      },
    },
    palette: {
      type: darkMode ? 'dark' : 'light',
      primary: {
        main: '#f0c000',
      },
      secondary: {
        main: '#208080',
      },
    },
  });

  const sidebarOpenHandler = () => {
    setSidebarVisibel(true);
  };
  const sidebarCloseHandler = () => {
    setSidebarVisibel(false);
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get('/api/products/categories');

      setCategories(data);
    } catch (err) {
      enqueueSnackbar(errorMsg(err), { variant: 'error' });
      setTimeout(closeSnackbar, 3000);
    }
  };

  const queryChangeHandler = (e) => {
    setQuery(e.target.value);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    router.push(`/search?query=${query}`);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const darkModeHandler = () => {
    dispatch({ type: darkMode ? 'DARK_MODE_OFF' : 'DARK_MODE_ON' });
    Cookies.set('darkMode', !darkMode ? 'ON' : 'OFF');
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const loginClickHandler = (e) => {
    setAnchorEl(e.currentTarget);
  };
  const loginMenuCloseHandler = (e, redirect) => {
    setAnchorEl(null);

    if (redirect && redirect !== 'backdropClick') {
      router.push(redirect);
    }
  };
  const logoutClickHandler = () => {
    setAnchorEl(null);
    dispatch({ type: 'USER_LOGOUT' });
    router.push('/');
  };

  return (
    <div>
      <Head>
        <title>{title ? `${title} - Small Amazona` : 'Small Amazona'}</title>
        {description && <meta name='description' content={description} />}
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar position='static' className={classes.navbar}>
          <Toolbar className={classes.toolbar}>
            <Box display='flex' alignItems='center'>
              <IconButton
                className={classes.menuButton}
                edge='start'
                aria-label='open drawer'
                onClick={sidebarOpenHandler}
              >
                <MenuIcon className={classes.navButton} />
              </IconButton>
              <NextLink href='/' passHref>
                <Link>
                  <Typography className={classes.brand}>amazona</Typography>
                </Link>
              </NextLink>
            </Box>
            <Drawer
              anchor='left'
              open={sidebarVisibel}
              onClose={sidebarCloseHandler}
            >
              <List>
                <ListItem>
                  <Box
                    display='flex'
                    alignItems='center'
                    justifyContent='space-between'
                  >
                    <Typography>Shopping by category</Typography>
                    <IconButton
                      aria-label='close'
                      onClick={sidebarCloseHandler}
                    >
                      <CancelIcon />
                    </IconButton>
                  </Box>
                </ListItem>
                <Divider light />
                {categories.map((category) => (
                  <NextLink
                    href={`/search?category=${category}`}
                    passHref
                    key={category}
                  >
                    <ListItem
                      button
                      component='a'
                      onClick={sidebarCloseHandler}
                    >
                      <ListItemText primary={category} />
                    </ListItem>
                  </NextLink>
                ))}
              </List>
            </Drawer>
            <div className={classes.searchSection}>
              <form onSubmit={submitHandler} className={classes.searchForm}>
                <InputBase
                  name='query'
                  onChange={queryChangeHandler}
                  placeholder='Search Products'
                  className={classes.searchInput}
                />
                <IconButton
                  type='submit'
                  className={classes.iconButton}
                  aria-label='search'
                >
                  <SearchIcon />
                </IconButton>
              </form>
            </div>
            <div>
              <Switch checked={darkMode} onChange={darkModeHandler}></Switch>
              <NextLink href='/cart' passHref>
                <Link suppressHydrationWarning={true}>
                  {cart.cartItems.length > 0 ? (
                    <Badge
                      color='secondary'
                      badgeContent={cart.cartItems.length}
                    >
                      Cart
                    </Badge>
                  ) : (
                    'Cart'
                  )}
                </Link>
              </NextLink>
              {process.browser && userInfo ? (
                <Fragment>
                  <Button
                    aria-controls='simple-menu'
                    aria-haspopup='true'
                    onClick={loginClickHandler}
                    className={classes.navButton}
                  >
                    {userInfo.name}
                  </Button>{' '}
                  <Menu
                    id='simple-menu'
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={loginMenuCloseHandler}
                  >
                    <MenuItem
                      onClick={(e) => loginMenuCloseHandler(e, '/profile')}
                    >
                      Profile
                    </MenuItem>
                    <MenuItem
                      onClick={(e) =>
                        loginMenuCloseHandler(e, '/order-history')
                      }
                    >
                      Order History
                    </MenuItem>
                    {userInfo.isAdmin && (
                      <MenuItem
                        onClick={(e) =>
                          loginMenuCloseHandler(e, '/admin/dashboard')
                        }
                      >
                        Admin Dashboard
                      </MenuItem>
                    )}
                    <MenuItem onClick={logoutClickHandler}>Logout</MenuItem>
                  </Menu>
                </Fragment>
              ) : (
                <NextLink href='/login' passHref>
                  <Link>Login</Link>
                </NextLink>
              )}
            </div>
          </Toolbar>
        </AppBar>
        <Container className={classes.main}>{children}</Container>
        <footer className={classes.footer}>
          <Typography>All rights reserved. Small Amazona</Typography>
        </footer>
      </ThemeProvider>
    </div>
  );
}
