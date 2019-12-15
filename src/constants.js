const localhost = 'http://127.0.0.1:8000';

const apiUrl = '/api';

export const endpoint = `${localhost}${apiUrl}`;


export const productListURL = `${endpoint}/products/`;
export const productDetailURL = id => `${endpoint}/products/${id}/`;;
export const addToCartURL = `${endpoint}/add-to-cart/`;
export const orderSumaryURL = `${endpoint}/order-summary/`;
export const checkoutURL = `${endpoint}/checkout/`;
export const addCouponURL = `${endpoint}/add-coupon/`;
export const addressListURL = addressType => `${endpoint}/addresses?address_type=${addressType}`;
export const addressCreateURL = `${endpoint}/addresses/create/`;
export const getCountriesListURL = `${endpoint}/countries/`;
export const getUserIdURL = `${endpoint}/user-id/`;