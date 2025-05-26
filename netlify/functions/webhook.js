const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const signature = event.headers['stripe-signature'];
  
  try {
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    // Handle the event
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        const session = stripeEvent.data.object;
        // Fulfill the purchase
        console.log(`Checkout completed: ${session.id}`);
        break;
        
      case 'customer.subscription.created':
        const subscription = stripeEvent.data.object;
        console.log(`Subscription created: ${subscription.id}`);
        break;
        
      case 'invoice.paid':
        const invoice = stripeEvent.data.object;
        console.log(`Invoice paid: ${invoice.id}`);
        break;
        
      case 'invoice.payment_failed':
        const failedInvoice = stripeEvent.data.object;
        console.log(`Payment failed: ${failedInvoice.id}`);
        break;
        
      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message }),
    };
  }
};