import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { Button, Header, Grid, Divider, Menu, Form, Loader, Segment, Dimmer, Message, Select, Card, Label } from 'semantic-ui-react';
import { authAxios } from '../utils';
import { addressListURL, getCountriesListURL, addressCreateURL, getUserIdURL, addressUpdateURL, addressDeleteURL } from '../constants';


const UPDATE_FORM = 'UPDATE_FORM';
const CREATE_FORM = 'CREATE_FORM';

class AddressForm extends Component {

  state = {
    loading: false,
    error: null,
    formData: {
      address_type: "",
      apartment_address: "",
      country: "",
      default: false,
      id: '',
      street_address: "",
      user: '',
      zip: "",
    },
    saving: false,
    success: false,
  }

  handleChange = e => {
    const { formData } = this.state;
    const updatedFormData = {
      ...formData,
      [e.target.name]: e.target.value
    }

    this.setState({ formData: updatedFormData });
  }

  handleSelectChange = (e, { name, value }) => {
    const { formData } = this.state;
    const updatedFormData = {
      ...formData,
      [name]: value
    }

    this.setState({ formData: updatedFormData });
  }

  handleToggleDefault = e => {
    const { formData } = this.state;
    const updatedFormData = {
      ...formData,
      default: !formData.default
    }

    this.setState({ formData: updatedFormData });
  }

  handleSubmit = e => {
    e.preventDefault();
    this.setState({ saving: true });

    const { formType } = this.props;
    if (formType === UPDATE_FORM) {
      this.handleUpdateAddress();
    } else {
      this.handleAddressCreate();
    }

  }

  handleAddressCreate = () => {
    const { userID, activeItem } = this.props;
    const { formData } = this.state;

    authAxios.post(addressCreateURL, {
      ...formData,
      address_type: activeItem === 'billingAddress' ? 'B' : 'S',
      user: userID
    })
      .then(res => {
        this.setState({
          saving: false, 
          success: true, 
          formData: {
            address_type: "",
            apartment_address: "",
            country: "",
            default: false,
            id: '',
            street_address: "",
            user: '',
            zip: "",
          }
        });
        this.props.callback();
      })
      .catch(err => {
        this.setState({ error: err.response.data });
      })
  }

  handleUpdateAddress = () => {
    const { userID, activeItem } = this.props;
    const { formData } = this.state;

    authAxios.put(addressUpdateURL(formData.id), {
      ...formData,
      address_type: activeItem === 'billingAddress' ? 'B' : 'S',
      user: userID
    })
      .then(res => {
        this.setState({
          saving: false, 
          success: true, 
          formData: {
            address_type: "",
            apartment_address: "",
            country: "",
            default: false,
            id: '',
            street_address: "",
            user: '',
            zip: "",
          }
        });
        this.props.callback();
      })
      .catch(err => {
        this.setState({ error: err.response.data });
      })
  }

  componentDidMount() {
    const { address, formType } = this.props;
    if (formType === UPDATE_FORM) {
      this.setState({
        formData: address
      });
      console.log(address)
    }
  }

  render() {
    const { countries } = this.props;
    const { error, success, saving, formData } = this.state;

    return (
      <Form onSubmit={this.handleSubmit} success={success} error={error}>

        <Form.Input value={formData.street_address} required name='street_address' placeholder='Street address' onChange={this.handleChange} />

        <Form.Input value={formData.apartment_address} required name='apartment_address' placeholder='Apartment address' onChange={this.handleChange} />

        <Form.Field required>
          <Select
            loading={countries.length < 1}
            fluid
            clearable
            search
            name='country'
            value={formData.country}
            placeholder="Country"
            options={countries}
            onChange={this.handleSelectChange}
          />
        </Form.Field>

        <Form.Input value={formData.zip} required name='zip' placeholder='Zip code' onChange={this.handleChange} />

        <Form.Checkbox checked={formData.default} name='default' label='Make this the default' onChange={this.handleToggleDefault} />

        {success && (
          <Message
            success
            header="Success!"
            content={'Your address was saved.'}
          />
        )}

        {error && (
          <Message
            error
            header="Some error occured!"
            content={JSON.stringify(error)}
          />
        )}
        <Form.Button primary disabled={saving} loading={saving}>
          Save
        </Form.Button>
      </Form>

    )
  }
}


class Profile extends Component {

  state = {
    userID: null,
    activeItem: 'billingAddress',
    addresses: [],
    countries: [],
    selectedAddress: null
  }

  componentDidMount() {
    this.handleFetchAddresses();
    this.handleFetchCountries();
    this.handleFetchUserID();
  }

  handleSelectedAddress = address => {
    this.setState({
      selectedAddress: address
    })
  }

  handleItemClick = name => {
    this.setState({ activeItem: name }, () => {
      this.handleFetchAddresses();
    });
  }

  handleFetchAddresses = () => {
    this.setState({ loading: true });

    const { activeItem } = this.state;
    authAxios.get(addressListURL(activeItem === 'billingAddress' ? 'B' : 'S'))
      .then(res => {
        this.setState({ addresses: res.data, loading: false });
      })
      .catch(err => {
        this.setState({ loading: false, error: err.response.data });
      })
  }

  handleFormatCountries = countries => {
    const keys = Object.keys(countries);
    return keys.map(k => {
      return {
        key: k,
        text: countries[k],
        value: k
      }
    })
  }

  handleFetchUserID = () => {
    authAxios.get(getUserIdURL)
      .then(res => {
        this.setState({ userID: res.data.userId });
      })
      .catch(err => {
        this.setState({ error: err.response.data });
      })
  }

  handleFetchCountries = () => {
    authAxios.get(getCountriesListURL)
      .then(res => {
        this.setState({ countries: this.handleFormatCountries(res.data) });
      })
      .catch(err => {
        this.setState({ error: err.response.data });
      })
  }

  handleDelete = addressID => {
    authAxios.delete(addressDeleteURL(addressID))
      .then(res => {
        this.handleCallback();
      })
      .catch(err => {
        this.setState({ error: err.response.data });
      })
  }

  handleCallback = () => {
    this.handleFetchAddresses();
    this.setState({ selectedAddress: null })
  }

  render() {
    const { activeItem, loading, error, addresses, countries, selectedAddress, userID } = this.state;

    const { isAuthenticated } = this.props;

    
    if(!isAuthenticated) {
      return <Redirect to='/login' />
    }

    return (
      <Grid container columns={2} divided>
        <Grid.Row columns={1}>
          <Grid.Column>
            {error && (
              <Message
                error
                header="Some error occured!"
                content={JSON.stringify(error)}
              />
            )}

            {loading && (
              <Segment>
                <Dimmer active inverted>
                  <Loader inverted content='Loading' />
                </Dimmer>
              </Segment>
            )}
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={6}>
            <Menu pointing vertical fluid>
              <Menu.Item
                name='Billing Address'
                active={activeItem === 'billingAddress'}
                onClick={() => this.handleItemClick('billingAddress')}
              />
              <Menu.Item
                name='Shipping Address'
                active={activeItem === 'shippingAddress'}
                onClick={() => this.handleItemClick('shippingAddress')}
              />
              <Menu.Item
                name='Payment History'
                active={activeItem === 'paymentHistory'}
                onClick={() => this.handleItemClick('paymentHistory')}
              />
            </Menu>
          </Grid.Column>

          <Grid.Column width={10}>
            <Header>{`Update your ${activeItem === 'billingAddress' ? 'billing' : 'shipping'} address`}</Header>
            <Divider />

            <Card.Group>
              {addresses.map(a => {
                return (
                  <Card fluid key={a.id}>
                    <Card.Content>
                      {a.default && <Label as='a' ribbon='right' color='green'>Default</Label>}
                      <Card.Header>{a.street_address}, {a.apartment_addres}</Card.Header>
                      <Card.Meta>{a.country}</Card.Meta>
                      <Card.Description>{a.zip}</Card.Description>
                    </Card.Content>

                    <Card.Content extra>
                      <Button color='yellow' onClick={() => this.handleSelectedAddress(a)}>
                        Update
                        </Button>
                      <Button color='red' onClick={() => this.handleDelete(a.id)}>
                        Delete
                        </Button>
                    </Card.Content>
                  </Card>
                )
              })}
            </Card.Group>

            <Divider />

            {selectedAddress === null ?
              <AddressForm countries={countries} callback={this.handleCallback} formType={CREATE_FORM} userID={userID} activeItem={activeItem} />
              :
              null
            }
            {selectedAddress && <AddressForm countries={countries} callback={this.handleCallback} userID={userID} activeItem={activeItem} formType={UPDATE_FORM} address={selectedAddress} />}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }

}

const mapStateToProps = state => {
  return {
    isAuthenticated: state.auth.token !== null
  }
}

export default connect(mapStateToProps)(Profile);
