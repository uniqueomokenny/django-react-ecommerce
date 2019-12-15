import React, { Component } from 'react'
import { Header, Grid, Divider, Menu, Form, Loader, Segment, Dimmer, Message, Select, Card, Label } from 'semantic-ui-react'
import { authAxios } from '../utils'
import { addressListURL, getCountriesListURL, addressCreateURL, getUserIdURL } from '../constants'

class Profile extends Component {

  state = { 
    userID: null,
    activeItem: 'billingAddress',
    loading: false,
    error: null,
    countries: [],
    addresses: [],
    formData: {
      default: false
    },
    saving: false,
    success: false,
  }

  componentDidMount() {
    this.handleFetchAddresses();
    this.handleFetchCountries();
    this.handleFetchUserID();
  }

  handleItemClick = name => {
    this.setState({ activeItem: name }, () => {
      this.handleFetchAddresses();
    });
  }

  handleFetchAddresses = () => {
    this.setState({ loading: true });

    const { activeItem } = this.state;
    authAxios.get(addressListURL(activeItem === 'billingAddress' ? 'B': 'S'))
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
        this.setState({ countries: this.handleFormatCountries(res.data)});
      })
      .catch(err => {
        this.setState({ error: err.response.data });
      })
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

  handleAddressCreate = e => {
    e.preventDefault();

    const { activeItem, formData, userID } = this.state;
    this.setState({ saving: true });

    authAxios.post(addressCreateURL, {
      ...formData,
      address_type: activeItem === 'billingAddress'? 'B': 'S',
      user: userID
    })
    .then(res => {
      this.setState({ saving: false, success: true });
    })
    .catch(err => {
      this.setState({ error: err.response.data });
    })
  }

  render() {
    const { activeItem, loading, error, addresses, countries, saving, success } = this.state;

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
              name='Shiiping Address'
              active={activeItem === 'shippingAddress'}
              onClick={() => this.handleItemClick('shippingAddress')}
            />
          </Menu>
          </Grid.Column>

          <Grid.Column width={10}>
            <Header>{`Update your ${activeItem === 'billingAddress'? 'billing': 'shipping'} address`}</Header>
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
                  </Card>
                )
              })}
            </Card.Group>

            <Divider />

            <Form onSubmit={this.handleAddressCreate} success={success}>

              <Form.Input required name='street_address' placeholder='Street address' onChange={this.handleChange} />
              
              <Form.Input required name='apartment_address' placeholder='Apartment address' onChange={this.handleChange} />
              
              <Form.Field required>
                <Select
                  loading={countries.length < 1} 
                  fluid
                  clearable
                  search
                  name='country'
                  placeholder="Country"
                  options={countries}
                  onChange={this.handleSelectChange}
                />
              </Form.Field>

              <Form.Input required name='zip' placeholder='Zip code' onChange={this.handleChange} />

              <Form.Checkbox name='default' label='Make this the default' onChange={this.handleToggleDefault} />
              
              {success && (
                <Message
                  success
                  header="Success!"
                  content={'Your address was saved.'}
                />
              )}
              <Form.Button primary disabled={saving} loading={saving}>
                Save
              </Form.Button>
            </Form>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}

export default Profile;
