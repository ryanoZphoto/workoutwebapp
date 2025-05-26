const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    const { sessionId } = JSON.parse(event.body);
    
    if (!sessionId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Session ID is required' }),
      };
    }
    
    // Retrieve the checkout session to verify it exists and was completed
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.status !== 'complete') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Subscription not completed' }),
      };
    }
    
    // Here you would update your database to mark the user as subscribed
    // const userId = session.metadata.userId;
    // await updateUserSubscriptionStatus(userId, true);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, subscriptionId: session.subscription }),
    };
  } catch (error) {
    console.error('Verification error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};