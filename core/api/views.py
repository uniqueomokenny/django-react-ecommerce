from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.http import Http404
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from core import models
from .serializers import ItemSerializer, OrderSerializer

import stripe
import random
import string

stripe.api_key = settings.STRIPE_SECRET_KEY


def create_ref_code():
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=20))


class ProductListView(ListAPIView):
    permission_classes = (AllowAny, )
    serializer_class = ItemSerializer
    queryset = models.Item.objects.all()


class AddtoCartView(APIView):
    def post(self, request, *args, **kwargs):
        slug = request.data.get('slug', None)
        if slug is None:
            return Response({"message": 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)
        
        item = get_object_or_404(models.Item, slug=slug)
        order_item, created = models.OrderItem.objects.get_or_create(
            item=item,
            user=request.user,
            ordered=False
        )
        order_qs = models.Order.objects.filter(user=request.user, ordered=False)
        if order_qs.exists():
            order = order_qs[0]
            # check if the order item is in the order
            if order.items.filter(item__slug=item.slug).exists():
                order_item.quantity += 1
                order_item.save()
                # messages.info(request, "This item quantity was updated.")
                # return redirect("core:order-summary")
                return Response(status.HTTP_200_OK)
            else:
                order.items.add(order_item)
                # messages.info(request, "This item was added to your cart.")
                # return redirect("core:order-summary")
                return Response(status.HTTP_200_OK)
        else:
            ordered_date = timezone.now()
            order = models.Order.objects.create(user=request.user, ordered_date=ordered_date)
            order.items.add(order_item)
            # messages.info(request, "This item was added to your cart.")
            # return redirect("core:order-summary")
            return Response(status.HTTP_200_OK)


class OrderDetailView(RetrieveAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = OrderSerializer

    def get_object(self):
        try:
            order = models.Order.objects.get(user=self.request.user, ordered=False)
            return order
        except ObjectDoesNotExist:
            raise Http404("You do not have an active order")
            # return Response({"messages","You do not have an active order"}, status=status.HTTP_400_BAD_REQUEST)


class PaymentView(APIView):

    def post(self, request, *args, **kwargs):
        order = models.Order.objects.get(user=request.user, ordered=False)
        userprofile = models.UserProfile.objects.get(user=request.user)
        token = request.data.get('stripeToken')
        # save = form.cleaned_data.get('save')
        # use_default = form.cleaned_data.get('use_default')

        save = False
        use_default = False

        if save:
            if userprofile.stripe_customer_id != '' and userprofile.stripe_customer_id is not None:
                customer = stripe.Customer.retrieve(
                    userprofile.stripe_customer_id)
                customer.sources.create(source=token)

            else:
                customer = stripe.Customer.create(
                    email=request.user.email,
                )
                customer.sources.create(source=token)
                userprofile.stripe_customer_id = customer['id']
                userprofile.one_click_purchasing = True
                userprofile.save()

        amount = int(order.get_total() * 100)

        try:

            if use_default or save:
                # charge the customer because we cannot charge the token more than once
                charge = stripe.Charge.create(
                    amount=amount,  # cents
                    currency="usd",
                    customer=userprofile.stripe_customer_id
                )
            else:
                # charge once off on the token
                charge = stripe.Charge.create(
                    amount=amount,  # cents
                    currency="usd",
                    source=token
                )

            # create the payment
            payment = models.Payment()
            payment.stripe_charge_id = charge['id']
            payment.user = request.user
            payment.amount = order.get_total()
            payment.save()

            # assign the payment to the order

            order_items = order.items.all()
            order_items.update(ordered=True)
            for item in order_items:
                item.save()

            order.ordered = True
            order.payment = payment
            order.ref_code = create_ref_code()
            order.save()

            return Response(status=status.HTTP_200_OK)

        except stripe.error.CardError as e:
            body = e.json_body
            err = body.get('error', {})
            return Response({'message': f"{err.get('message')}"}, status=status.HTTP_400_BAD_REQUEST)

        except stripe.error.RateLimitError as e:
            # Too many requests made to the API too quickly
            return Response({'message': "Rate limit error"}, status=status.HTTP_400_BAD_REQUEST)

        except stripe.error.InvalidRequestError as e:
            # Invalid parameters were supplied to Stripe's API
            print(e)
            return Response({'message': "Invalid parameters"}, status=status.HTTP_400_BAD_REQUEST)

        except stripe.error.AuthenticationError as e:
            # Authentication with Stripe's API failed
            # (maybe you changed API keys recently)
            return Response({'message': "Not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)

        except stripe.error.APIConnectionError as e:
            # Network communication with Stripe failed
            return Response({'message': "Network error"}, status=status.HTTP_400_BAD_REQUEST)

        except stripe.error.StripeError as e:
            # Display a very generic error to the user, and maybe send
            # yourself an email
            return Response({'message': "Something went wrong. You were not charged. Please try again."}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            # send an email to ourselves
            return Response({'message': "A serious error occurred. We have been notifed."}, status=status.HTTP_400_BAD_REQUEST)


        return Response({'message': "Invalid data received"}, status=status.HTTP_400_BAD_REQUEST)
        