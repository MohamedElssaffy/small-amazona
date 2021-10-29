import {
  Button,
  FormControl,
  FormControlLabel,
  List,
  ListItem,
  Radio,
  RadioGroup,
  Typography,
} from '@material-ui/core';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect, useState } from 'react';
import CheckoutWizard from '../components/CheckoutWizard';
import Layout from '../components/Layout';
import { Store } from '../utils/store';
import useStyle from '../utils/styles';

export default function PaymentPage() {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const {
    cart: { shippingAddress, paymentMethod: paymentValue },
  } = state;
  const classes = useStyle();
  const [paymentMethod, setPaymentMethod] = useState('');
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  console.log({ paymentMethod });
  useEffect(() => {
    if (!shippingAddress.address) {
      router.push('/shipping');
    } else {
      setPaymentMethod(paymentValue);
    }
  }, []);

  const submitHandler = (e) => {
    closeSnackbar();
    e.preventDefault();
    if (!paymentMethod) {
      enqueueSnackbar('Please Choose Method to Payment', { variant: 'error' });
    } else {
      dispatch({ type: 'SAVE_PAYMENT_METHOD', payload: paymentMethod });
      router.push('/placeorder');
    }
  };

  return (
    <Layout>
      <CheckoutWizard activeStep={2} />
      <form onSubmit={submitHandler} className={classes.form}>
        <Typography component='h1' variant='h1'>
          Payment Method
        </Typography>
        <List>
          <ListItem>
            <FormControl component='fieldset'>
              <RadioGroup
                aria-label='Payment Method'
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                name='paymentMethod'
              >
                <FormControlLabel
                  label='Online'
                  value='PayPal'
                  control={<Radio />}
                />
                <FormControlLabel
                  label='Cach'
                  value='Cach'
                  control={<Radio />}
                />
              </RadioGroup>
            </FormControl>
          </ListItem>
          <ListItem>
            <Button color='primary' variant='contained' fullWidth type='submit'>
              Continue
            </Button>
          </ListItem>
          <ListItem>
            <Button
              variant='contained'
              fullWidth
              type='button'
              onClick={() => router.push('/shipping')}
            >
              Back to Shipping
            </Button>
          </ListItem>
        </List>
      </form>
    </Layout>
  );
}
