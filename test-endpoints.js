// Run this in your browser console when using Netlify Dev

// Test create-checkout-session
fetch('/api/create-checkout-session', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    priceId: process.env.REACT_APP_STRIPE_PRICE_ID,
    productDescription: {
      name: "Fitness Tracker Premium",
      description: "Unlock your full fitness potential with advanced tracking, personalized workouts, and exclusive features.",
      features: [
        "Unlimited workout logging and tracking",
        "Personalized workout recommendations based on your history",
        "Advanced analytics and progress reporting",
        "Custom meal planning and nutrition tracking",
        "Hydration monitoring with smart reminders",
        "Export and backup your fitness data",
        "Priority access to new features"
      ],
      trialPeriod: "First month FREE",
      billingCycle: "Monthly subscription",
      price: "$1.00/month"
    } // Comprehensive subscription details
  }),
})
.then(response => {
  console.log('Response status:', response.status);
  return response.json();
})
.then(data => console.log('Checkout session response:', data))
.catch(error => console.error('Error:', error));

// Test customer-portal access
// Only run this if you have a customer ID
/*
fetch('/api/customer-portal', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    customerId: 'cus_YOUR_CUSTOMER_ID', // Replace with an actual customer ID
    returnUrl: window.location.href,
  }),
})
.then(response => {
  console.log('Portal response status:', response.status);
  return response.json();
})
.then(data => console.log('Customer portal response:', data))
.catch(error => console.error('Error:', error));
*/
