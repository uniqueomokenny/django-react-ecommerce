import React, {Component} from 'react';
import {CardElement, injectStripe, Elements, StripeProvider} from 'react-stripe-elements';
import { Container, Button, Message } from 'semantic-ui-react';
import { authAxios } from '../utils';
import { checkoutURL } from '../constants';

class CheckoutForm extends Component {
  state = {
    loading: false,
    success: false,
    error: null
  }

  submit = (e) => {
    e.preventDefault();
    this.setState({ loading: true });
    if(this.props.stripe) {
      this.props.stripe.createToken()
        .then(result => {
          if(result.error) {
            this.setState({ error: result.error.message, loading: false })
          } else {
            authAxios.post(checkoutURL, { stripeToken: result.token.id })
              .then(res => {
                this.setState({ loading: false, success: true });
              })
              .catch(err => {
                this.setState({ loading: false, error: err });
              })
          }
        })
    } else {
      console.log('Stripe is not loaded')
    }
  }

  render() {
    const { error, loading, success } = this.state;

    return (
      <div className="checkout">
        {error && (
          <Message negative>
            <Message.Header>Your payment unsuccessful</Message.Header>
            <p>
              {JSON.stringify(error)}
            </p>
          </Message>
        )}

        {success && (
          <Message positive>
            <Message.Header>Your payment was successful</Message.Header>
            <p>
              Go to your <b>profile</b> to see the delivery status.
            </p>
          </Message>
        )}
        
        <p>Would you like to complete the purchase?</p>
        <CardElement />
        <Button primary loading={loading} disabled={loading} onClick={this.submit} style={{ marginTop: '1rem'}}>Submit</Button>
      </div>   
    );
  }
}

const InjectedForm = injectStripe(CheckoutForm);

const WrappedCheckoutForm = () => (
  <Container text>
    <StripeProvider apiKey="pk_test_jPO1MtcAbyylYSkZe0RGmRHw00QcwqEVKQ">
      <>
        <h1>Complete your order.</h1>
        <Elements>
          <InjectedForm />
        </Elements>
      </>
    </StripeProvider>
  </Container>
)

export default WrappedCheckoutForm;
