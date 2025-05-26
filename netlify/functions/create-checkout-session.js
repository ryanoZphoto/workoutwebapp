const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  console.log('Function invoked with body:', event.body);
  
  try {
    const { priceId } = JSON.parse(event.body);
    
    if (!priceId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Price ID is required' }),
      };
    }
    
    console.log('Creating checkout session with price ID:', priceId);
    
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 30,
      },
      success_url: process.env.DOMAIN + '/success',
      cancel_url: process.env.DOMAIN + '/cancel',
    });

    console.log('Session created:', session.id);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
