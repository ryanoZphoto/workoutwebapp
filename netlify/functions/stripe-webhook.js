const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const signature = event.headers['stripe-signature'];
  
  try {
    // Verify webhook signature
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    // Handle different event types
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        // A customer successfully subscribed
        const session = stripeEvent.data.object;
        console.log('Checkout completed:', session.id);
        // Here you would update your database to mark the user as subscribed
        break;
        
      case 'invoice.paid':
        // Continue subscription
        const invoice = stripeEvent.data.object;
        console.log('Invoice paid:', invoice.id);
        break;
        
      case 'invoice.payment_failed':
        // Notify customer of failed payment
        const failedInvoice = stripeEvent.data.object;
        console.log('Payment failed:', failedInvoice.id);
        break;
        
      case 'customer.subscription.deleted':
        // Subscription canceled or expired
        const subscription = stripeEvent.data.object;
        console.log('Subscription canceled:', subscription.id);
        // Update user's subscription status in your database
        break;
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