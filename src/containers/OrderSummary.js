import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Label, Table, Container, Header, Button, Message, Segment, Dimmer, Loader, Image } from 'semantic-ui-react'
import { authAxios } from '../utils';
import { orderSumaryURL } from '../constants';


class OrderSummary extends Component {
  state = {
    data: null,
    error: null,
    loading: null
  }

  componentDidMount() {
    this.handleFetchOrder();
  }

  handleFetchOrder = () => {
    this.setState({ loading: true });
    authAxios
      .get(orderSumaryURL)
      .then(res => {
        this.setState({ data: res.data, loading: false });
      })
      .catch(error => {
        if(error.response.status === 404) {
          this.setState({ error: "You currently do not have an order", loading: false});
        } else {
          this.setState({ error, loading: false });
        }
      });
  }

  render() {
    const { data, loading, error } = this.state;

    return (
      <Container>
        <Header as="h3">Order Summary</Header>
        {error && (
          <Message negative>
            <Message.Header>No Items found in the cart.</Message.Header>
            <p>
              {JSON.stringify(error)}
            </p>
          </Message>
        )}

        {loading && (
            <Segment>
                <Dimmer active inverted>
                    <Loader inverted content='Loading' />
                </Dimmer>

                <Image src='/images/wireframe/short-paragraph.png' />
            </Segment>
        )}

        {data && (
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Item #</Table.HeaderCell>
                <Table.HeaderCell>Item name</Table.HeaderCell>
                <Table.HeaderCell>Item price</Table.HeaderCell>
                <Table.HeaderCell>Item quantity</Table.HeaderCell>
                <Table.HeaderCell>Item item price</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {data.order_items.map((order_item, i) => (
                <Table.Row key={order_item.id}>
                  <Table.Cell>{i}</Table.Cell>
                  <Table.Cell>{order_item.item}</Table.Cell>
                  <Table.Cell>${order_item.item_obj.price}</Table.Cell>
                  <Table.Cell>{order_item.quantity}</Table.Cell>
                  <Table.Cell>
              {order_item.item_obj.discount_price && <Label color='green' ribbon>@${order_item.item_obj.discount_price}</Label>}
                    {order_item.final_price}
                  </Table.Cell>

                  
                </Table.Row>
              ))}

                <Table.Row textAlign='center'>
                  <Table.Cell />
                  <Table.Cell />
                  <Table.Cell />
                  <Table.Cell colSpan='2'>
                    Total: ${data.total}
                  </Table.Cell>
                </Table.Row>
            </Table.Body>

            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell colSpan='5' textAlign='right'>
                  <Link to='/checkout'>
                    <Button color='yellow'>
                      Checkout
                    </Button>
                  </Link>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>
        )}
      
      </Container>
    )
  }
}

export default OrderSummary;