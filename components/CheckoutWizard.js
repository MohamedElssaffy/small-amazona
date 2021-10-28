import { Step, StepLabel, Stepper } from '@material-ui/core';
import React from 'react';
import useStyle from '../utils/styles';

export default function CheckoutWizard({ activeStep = 0 }) {
  const classes = useStyle();
  return (
    <Stepper
      activeStep={activeStep}
      alternativeLabel
      className={classes.transparentBg}
    >
      {['Login', 'Shipping Address', 'Payment Method', 'Place Order'].map(
        (step) => (
          <Step key={step}>
            <StepLabel>{step}</StepLabel>
          </Step>
        )
      )}
    </Stepper>
  );
}
