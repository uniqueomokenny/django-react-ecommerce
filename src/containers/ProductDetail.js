import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import axios from 'axios';
import {
    Button,
    Card,
    Icon,
    Image,
    Item,
    Label,
    Container,
    Loader,
    Dimmer,
    Segment,
    Message,
    Grid,
    Header
} from 'semantic-ui-react'

import { productDetailURL, addToCartURL } from '../constants';
import { authAxios } from '../utils';
import { fetchCart } from '../store/actions/cart';


class ProductDetail extends React.Component {
    state = {
        loading: false,
        error: null,
        data: []
    }

    componentDidMount() {
        this.handleFetchItem()
    }

    handleFetchItem() {
        this.setState({ loading: true });

        const { match: {params} } = this.props;

        axios.get(productDetailURL(params.productID))
            .then(res => {
                this.setState({ data: res.data, loading: false });
            })
            .catch(error => {
                this.setState({ error, loading: false })
            })
    }

    handleAddToCart = slug => {
        this.setState({ loading: true });

        authAxios.post(addToCartURL, { slug })
            .then(res => {
                console.log("Added to cart", res.data)
                // update cart count
                this.props.fetchCart();
                this.setState({ loading: false });
            })
            .catch(error => {
                this.setState({ error: error.response.data, loading: false });
            })
    }

    render() {
        const { loading, error, data } = this.state;

        const product = data;

        console.log(product)
        return (
            <Container>
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

                        <Image src='/images/wireframe/short-paragraph.png' />
                    </Segment>
                )}
                <Grid columns={2} divided>
                    <Grid.Row>
                        <Grid.Column>
                            <Card
                                fluid
                                image={product.image}
                                header={product.title}
                                meta={
                                    (
                                        <>
                                            {product.category}
                                            {product.discount_price && (
                                                <Label 
                                                    color={product.label === 'primary'? 'blue': product.label === 'secondary'? 'red': 'olive'}>
                                                    {product.label}
                                                </Label>
                                            )}
                                        </>
                                    )
                                }
                                description={product.description}
                                extra={(
                                    <>
                                        <Button onClick={() => this.handleAddToCart(product.slug)} color='yellow' fluid icon labelPosition='right'>
                                            Add to cart
                                            <Icon name='cart plus' />
                                        </Button>
                                        
                                    </>
                                )}
                            />
                        </Grid.Column>

                        <Grid.Column>
                        <Header as='h2'>Try different variations.</Header>
                        {product.variations && (
                            product.variations.map(variation => (
                                <>  
                                    <Header as='h3'>{variation.name}</Header>
                                    <Item.Group divided key={variation.id}>
                                        {variation.item_variations.map(iv => (
                                            <Item key={iv.id}>
                                                {iv.attachment && (
                                                    <Item.Image size='tiny' src={`http://127.0.0.1:8000${iv.attachment}`} />
                                                )}
                                                <Item.Content verticalAlign='middle'>{iv.value}</Item.Content>
                                            </Item>
                                        ))}
                                    </Item.Group>
                                </>
                            ))
                        )}
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Container>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return {
        fetchCart: () => dispatch(fetchCart())
    };
};

export default withRouter(connect(null, mapDispatchToProps)(ProductDetail));