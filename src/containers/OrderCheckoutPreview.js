import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Container, Header, Item, Message, Segment, Dimmer, Loader, Image, Label } from 'semantic-ui-react'
import { authAxios } from '../utils';
import { orderSumaryURL } from '../constants';


class OrderCheckoutPreview extends Component {
  render() {
    const { data } = this.props;
    console.log('data', data)

    return (
      <Container>
        <Header as="h3">Order Summary</Header>
        {data && data.order_items.map(order_item => (
          <Item.Group relaxed key={order_item.id}>
            <Item>
              <Item.Image size='tiny' src={`http://127.0.0.1:8000${order_item.item_obj.image}`} />

              <Item.Content verticalAlign='middle'>
                <Item.Header as='a'>{order_item.quantity} x {order_item.item_obj.title}</Item.Header>
                <Item.Extra>
                  <Label>${order_item.final_price.toFixed(2)}</Label>
                </Item.Extra>
              </Item.Content>
            </Item>
          </Item.Group>
        ))}
        {data && (
          <Item.Group>
            <Item>
              <Item.Content>
                <Item.Header as='a'>
                  Order Total: ${data.total.toFixed(2)}
                  {data.coupon && <Label style={{marginLeft: '1rem'}} color='green'>Current coupon: {data.coupon.code} for ${data.coupon.amount}</Label>}
                </Item.Header>
              </Item.Content>
            </Item>
          </Item.Group>
        )}
      
      </Container>
    )
  }
}

export default OrderCheckoutPreview;