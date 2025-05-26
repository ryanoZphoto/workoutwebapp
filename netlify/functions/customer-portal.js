const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { customerId, returnUrl } = JSON.parse(event.body);
    
    if (!customerId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Customer ID is required' }),
      };
    }
    
    // Create a customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || process.env.DOMAIN,
      flow_data: {
        type: 'subscription_cancel',
        subscription_cancel: {
          // Show special message about cancellation
          confirmation_page: {
            enabled: true,
            custom_message: 
              `You're about to cancel your Premium subscription. 
              This means you'll lose access to personalized workouts, 
              advanced analytics, and nutrition tracking. 
              If you're in your free month, cancellation will take effect immediately with no charge.
              If you're in a paid subscription, you'll have access until the end of your billing period.`
          }
        }
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    console.error('Error creating portal session:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
