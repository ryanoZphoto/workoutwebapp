const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { priceId } = JSON.parse(event.body);
    
    if (!priceId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Price ID is required' }),
      };
    }
    
    // Get the product description if provided
    const { productDescription } = JSON.parse(event.body);
    
    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      line_items: [
        {
          price: priceId,
          quantity: 1,
          description: "Unlimited access to all premium features with FIRST MONTH FREE"
        },
      ],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 30, // 30 days = 1 month free trial
        metadata: {
          product_name: "Fitness Tracker Premium",
          features: "Advanced tracking, personalized workouts, meal planning, analytics",
          price: "$1.00/month after first month free"
        }
      },
      allow_promotion_codes: true,
      metadata: {
        features: "Personalized workouts, advanced analytics, nutrition tracking, hydration monitoring, data export",
        product_type: "fitness_subscription",
        pricing: "First month FREE, then just $1.00/month",
        trial_info: "Full access during free month trial, cancel anytime with no charge"
      },
      // {CHECKOUT_SESSION_ID} is a template literal that Checkout will replace
      success_url: `${process.env.DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.DOMAIN}/cancel`,
    });

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

