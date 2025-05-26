require('dotenv').config({ path: '.env.local' });
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const winston = require('winston');
const { MongoClient } = require('mongodb');
const nodemailer = require('nodemailer');
const retry = require('async-retry');
const app = express();

// Configure logging
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'stripe-webhook' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Database connection (initialize if needed)
let db;
async function connectToDatabase() {
  try {
    if (!process.env.MONGODB_URI) {
      logger.info('No MongoDB URI provided, skipping database connection');
      return null;
    }
    
    logger.info('Connecting to MongoDB...');
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    return client.db(process.env.MONGODB_DATABASE || 'workoutwebapp');
  } catch (error) {
    logger.error(`Failed to connect to database: ${error.message}`);
    return null;
  }
}

// Email configuration (initialize if needed)
let emailTransporter;
function initializeEmailTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    logger.info('Email credentials not provided, email notifications disabled');
    return null;
  }
  
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
}

// Middleware for parsing Stripe webhook payload
// This must come before any other body parsers for Stripe webhooks
app.post('/webhook', express.raw({type: 'application/json'}), handleWebhook);

// For all other routes, use regular JSON parsing
app.use(express.json());

// Webhook event handler function
async function handleWebhook(request, response) {
  const sig = request.headers['stripe-signature'];
  
  let event;
  
  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    logger.error(`⚠️ Webhook signature verification failed: ${err.message}`);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Log the event
  logger.info(`✅ Received event: ${event.type}`);
  
  try {
    // Check if we've already processed this event (idempotency check)
    if (db) {
      const processedEvents = db.collection('processedEvents');
      const existingEvent = await processedEvents.findOne({ id: event.id });
      
      if (existingEvent) {
        logger.warn(`Event ${event.id} already processed, skipping`);
        return response.json({ received: true, already_processed: true });
      }
      
      // Mark as received immediately to prevent duplicates
      await processedEvents.insertOne({ 
        id: event.id, 
        type: event.type,
        receivedAt: new Date(),
        processed: false
      });
    }
    
    // Process the event - pass to async handler but don't wait
    // This ensures we respond to Stripe quickly
    processWebhookEvent(event)
      .then(async () => {
        if (db) {
          // Mark as fully processed
          await db.collection('processedEvents').updateOne(
            { id: event.id },
            { $set: { processed: true, processedAt: new Date() } }
          );
        }
        logger.info(`✅ Completed processing event: ${event.type}`);
      })
      .catch(error => {
        logger.error(`❌ Error processing webhook: ${error.message}`, { error });
      });
    
    // Return success response immediately
    return response.json({ received: true });
  } catch (err) {
    logger.error(`❌ Error in webhook handler: ${err.message}`, { error: err });
    return response.status(500).send(`Webhook Error: ${err.message}`);
  }
}

// Async function to process webhook events
async function processWebhookEvent(event) {  try {
    switch (event.type) {
      // Payment events
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      
      // Subscription events
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
    
      // Checkout events
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      // Customer events  
      case 'customer.created':
        await handleCustomerCreated(event.data.object);
        break;
      case 'customer.updated':
        await handleCustomerUpdated(event.data.object);
        break;
      
      default:
        logger.warn(`⚠️ Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    logger.error(`Failed to process webhook event ${event.type}: ${error.message}`, { error });
    throw error; // Rethrow to be caught by the outer handler
  }
}

// Event handler implementations with retry logic
async function handlePaymentIntentSucceeded(paymentIntent) {
  return retry(async () => {
    logger.info(`💰 PaymentIntent succeeded: ${paymentIntent.id} for $${paymentIntent.amount / 100}`);
    
    if (db) {
      // Update order status in database
      const ordersCollection = db.collection('orders');
      if (paymentIntent.metadata && paymentIntent.metadata.orderId) {
        await ordersCollection.updateOne(
          { orderId: paymentIntent.metadata.orderId },
          { 
            $set: { 
              status: 'paid',
              paymentIntentId: paymentIntent.id,
              amountPaid: paymentIntent.amount,
              paymentMethod: paymentIntent.payment_method_types[0],
              paidAt: new Date()
            }
          }
        );
      }
    }
    
    // Send confirmation email
    if (emailTransporter && paymentIntent.receipt_email) {
      await emailTransporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || 'Workout App'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
        to: paymentIntent.receipt_email,
        subject: "Payment Confirmation",
        text: `Thank you for your payment of $${paymentIntent.amount / 100}`,
        html: `
          <h2>Payment Confirmation</h2>
          <p>Thank you for your payment of <strong>$${paymentIntent.amount / 100}</strong>.</p>
          <p>Payment ID: ${paymentIntent.id}</p>
          <p>Date: ${new Date().toLocaleString()}</p>
        `
      });
    }
  }, { retries: 3 });
}

async function handlePaymentIntentFailed(paymentIntent) {
  return retry(async () => {
    logger.warn(`❌ PaymentIntent failed: ${paymentIntent.id}, reason: ${paymentIntent.last_payment_error?.message || 'unknown'}`);
    
    if (db) {
      // Update order status
      const ordersCollection = db.collection('orders');
      if (paymentIntent.metadata && paymentIntent.metadata.orderId) {
        await ordersCollection.updateOne(
          { orderId: paymentIntent.metadata.orderId },
          { 
            $set: { 
              status: 'payment_failed',
              paymentIntentId: paymentIntent.id,
              failureReason: paymentIntent.last_payment_error?.message || 'unknown',
              failedAt: new Date()
            }
          }
        );
      }
    }
    
    // Notify customer about failed payment
    if (emailTransporter && paymentIntent.receipt_email) {
      await emailTransporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || 'Workout App'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
        to: paymentIntent.receipt_email,
        subject: "Payment Failed",
        text: `Your payment of $${paymentIntent.amount / 100} was unsuccessful. Reason: ${paymentIntent.last_payment_error?.message || 'unknown'}`,
        html: `
          <h2>Payment Failed</h2>
          <p>Your payment of <strong>$${paymentIntent.amount / 100}</strong> was unsuccessful.</p>
          <p>Reason: ${paymentIntent.last_payment_error?.message || 'unknown'}</p>
          <p>Please update your payment information or contact support for assistance.</p>
        `
      });
    }
  }, { retries: 3 });
}

async function handleSubscriptionCreated(subscription) {
  return retry(async () => {
    logger.info(`🔄 Subscription created: ${subscription.id}, status: ${subscription.status}`);
    
    // Check if subscription is in trial period
    const isInTrial = subscription.status === 'trialing';
    const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;
    
    if (db) {
      // Store subscription in database
      const subscriptionsCollection = db.collection('subscriptions');
      await subscriptionsCollection.insertOne({
        stripeSubscriptionId: subscription.id,
        customerId: subscription.customer,
        status: subscription.status,
        planId: subscription.items.data[0].price.product,
        priceId: subscription.items.data[0].price.id,
        amount: subscription.items.data[0].price.unit_amount,
        interval: subscription.items.data[0].price.recurring.interval,
        isInTrial: isInTrial,
        trialEnd: trialEnd,
        productDetails: subscription.metadata || {},
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        createdAt: new Date(),
        pricingInfo: "First month FREE, then $1.00/month"
      });
    }
  }, { retries: 3 });
}

async function handleSubscriptionUpdated(subscription) {
  return retry(async () => {
    logger.info(`🔄 Subscription updated: ${subscription.id}, status: ${subscription.status}`);
    
    if (db) {
      // Update subscription in database
      const subscriptionsCollection = db.collection('subscriptions');
      await subscriptionsCollection.updateOne(
        { stripeSubscriptionId: subscription.id },
        {
          $set: {
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            updatedAt: new Date()
          }
        }
      );
    }
  }, { retries: 3 });
}

async function handleSubscriptionCancelled(subscription) {
  return retry(async () => {
    logger.info(`❌ Subscription cancelled: ${subscription.id}`);
    
    if (db) {
      // Update subscription in database
      const subscriptionsCollection = db.collection('subscriptions');
      await subscriptionsCollection.updateOne(
        { stripeSubscriptionId: subscription.id },
        {
          $set: {
            status: 'cancelled',
            cancelledAt: new Date(),
            updatedAt: new Date()
          }
        }
      );
    }
    
    // Send cancellation email if we have customer info
    if (emailTransporter && subscription.customer) {
      try {
        // Get customer email from Stripe
        const customer = await stripe.customers.retrieve(subscription.customer);
        
        if (customer && customer.email) {
          await emailTransporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'Workout App'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
            to: customer.email,
            subject: "Subscription Cancelled",
            text: `Your subscription has been cancelled. We hope to see you again soon!`,
            html: `
              <h2>Subscription Cancelled</h2>
              <p>Your subscription has been cancelled.</p>
              <p>We hope to see you again soon!</p>
              <p>If you didn't intend to cancel, please contact our support team.</p>
            `
          });
        }
      } catch (error) {
        logger.error(`Error sending cancellation email: ${error.message}`);
      }
    }
  }, { retries: 3 });
}

async function handleInvoicePaymentSucceeded(invoice) {
  return retry(async () => {
    logger.info(`💰 Invoice payment succeeded: ${invoice.id} for $${invoice.amount_paid / 100}`);
    
    // Check if this is the first payment after trial
    const isFirstPayment = invoice.billing_reason === 'subscription_cycle' && 
                          invoice.lines && 
                          invoice.lines.data.some(line => line.description?.includes('after trial'));
    
    if (db && invoice.subscription) {
      // Update subscription payment history
      const subscriptionPaymentsCollection = db.collection('subscriptionPayments');
      await subscriptionPaymentsCollection.insertOne({
        subscriptionId: invoice.subscription,
        invoiceId: invoice.id,
        customerId: invoice.customer,
        amountPaid: invoice.amount_paid,
        isFirstPaymentAfterTrial: isFirstPayment,
        paidAt: new Date()
      });
      
      // Update subscription status if needed
      if (isFirstPayment) {
        const subscriptionsCollection = db.collection('subscriptions');
        await subscriptionsCollection.updateOne(
          { stripeSubscriptionId: invoice.subscription },
          {
            $set: {
              status: 'active',
              isInTrial: false,
              convertedFromTrial: true,
              convertedAt: new Date()
            }
          }
        );
      }
    }
    
    // Send invoice receipt email if configured
    if (emailTransporter && invoice.customer_email) {
      let emailSubject = "Payment Receipt";
      let emailContent = `<h2>Payment Receipt</h2>
                         <p>Thank you for your payment of <strong>$${invoice.amount_paid / 100}</strong>.</p>
                         <p>Invoice ID: ${invoice.id}</p>`;
      
      // Add special messaging for first payment after trial
      if (isFirstPayment) {
        emailSubject = "Your Free Trial Has Ended - Subscription Active";
        emailContent = `<h2>Your Free Month Trial Has Ended</h2>
                       <p>Thank you for trying Fitness Tracker Premium! Your subscription is now active.</p>
                       <p>You have been charged <strong>$${invoice.amount_paid / 100}</strong> for your first month.</p>
                       <p>Your subscription will renew automatically at $1.00/month.</p>`;
      }
      
      await emailTransporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || 'Workout App'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
        to: invoice.customer_email,
        subject: emailSubject,
        html: emailContent
      });
    }
  }, { retries: 3 });
}

async function handleInvoicePaymentFailed(invoice) {
  console.log(`❌ Invoice payment failed: ${invoice.id}`);
  
  // Example: Send dunning email
  // await sendPaymentFailureEmail(invoice.customer, invoice.subscription);
}

async function handleCheckoutSessionCompleted(session) {
  return retry(async () => {
    logger.info(`✅ Checkout completed: ${session.id}`);
    
    // Different handling based on session mode
    if (session.mode === 'payment') {
      // One-time payment checkout
      logger.info(`Processing one-time payment for session ${session.id}`);
    } else if (session.mode === 'subscription') {
      // Subscription checkout - now with trial period
      logger.info(`New subscription started: ${session.subscription}, with 1-month free trial`);
      
      if (db && session.subscription) {
        // Make sure we have the latest subscription data
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        
        // Update user's subscription status
        const usersCollection = db.collection('users');
        if (session.customer) {
          await usersCollection.updateOne(
            { stripeCustomerId: session.customer },
            { 
              $set: { 
                subscriptionId: session.subscription,
                subscriptionStatus: subscription.status,
                isInTrial: subscription.status === 'trialing',
                trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
                subscriptionPlan: "premium",
                premiumFeatures: true,
                subscription: {
                  id: session.subscription,
                  status: subscription.status,
                  currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                  cancelAtPeriodEnd: subscription.cancel_at_period_end,
                  pricing: "$1.00/month after free trial",
                  trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
                }
              }
            },
            { upsert: true }
          );
        }
      }
      
      // Send welcome email with trial information
      if (emailTransporter && session.customer_email) {
        await emailTransporter.sendMail({
          from: `"${process.env.EMAIL_FROM_NAME || 'Workout App'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
          to: session.customer_email,
          subject: "Welcome to Fitness Tracker Premium - Your Free Month Started",
          html: `
            <h2>Welcome to Fitness Tracker Premium!</h2>
            <p>Your free month trial has started. Enjoy full access to all premium features:</p>
            <ul>
              <li><strong>Personalized workouts</strong> based on your goals and history</li>
              <li><strong>Advanced analytics</strong> to track your progress in detail</li>
              <li><strong>Complete nutrition & hydration tracking</strong></li>
              <li><strong>Data export & backup</strong> for all your fitness data</li>
            </ul>
            <p>After your trial ends, you'll be charged just <strong>$1.00/month</strong>.</p>
            <p>You can cancel anytime before the trial ends and won't be charged.</p>
            <p>We're excited to be part of your fitness journey!</p>
          `
        });
      }
    }
  }, { retries: 3 });
}

async function handleCustomerCreated(customer) {
  console.log(`👤 Customer created: ${customer.id}, email: ${customer.email}`);
  
  // Example: Link Stripe customer to your user
  // await db.users.update(
  //   { email: customer.email },
  //   { stripeCustomerId: customer.id }
  // );
}

async function handleCustomerUpdated(customer) {
  console.log(`👤 Customer updated: ${customer.id}`);
  
  // Example: Update customer info in your database
  // await db.customers.update(
  //   { stripeCustomerId: customer.id },
  //   {
  //     email: customer.email,
  //     name: customer.name,
  //     phone: customer.phone,
  //     updatedAt: new Date()
  //   }
  // );
}

// Health check endpoint
app.get('/webhook-test', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log(`
🚀 Stripe webhook server running on port ${PORT}
🔗 Test endpoint: http://localhost:${PORT}/webhook-test
📝 Webhook URL: http://localhost:${PORT}/webhook
  `);
});

// Graceful shutdown
process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

function shutDown() {
  console.log('Received kill signal, shutting down gracefully');
  app.close(() => {
    console.log('Closed out remaining connections');
    process.exit(0);
  });
  
  // Force shutdown after 10s
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}