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
    
    // Get subscription details including trial information
    let trialInfo = null;
    let subscriptionDetails = null;
    
    if (session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      
      trialInfo = {
        isInTrial: subscription.status === 'trialing',
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        trialDays: 30, // 1 month free trial
      };
      
      subscriptionDetails = {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        priceAmount: "1.00",
        priceCurrency: "USD",
        interval: "month"
      };
    }
    
    // Here you would update your database to mark the user as subscribed
    // const userId = session.metadata.userId;
    // await updateUserSubscriptionStatus(userId, true, trialInfo);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        subscriptionId: session.subscription,
        trial: trialInfo,
        subscription: subscriptionDetails,
        pricing: {
          trialPeriod: "First month FREE",
          afterTrial: "$1.00/month"
        }
      }),
    };
  } catch (error) {
    console.error('Verification error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};