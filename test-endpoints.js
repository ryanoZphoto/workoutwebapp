// Run this in your browser console when using Netlify Dev

// Test create-checkout-session
fetch('/api/create-checkout-session', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    priceId: 'price_your_actual_price_id' // Replace with your actual Stripe price ID
  }),
})
.then(response => {
  console.log('Response status:', response.status);
  return response.json();
})
.then(data => console.log('Checkout session response:', data))
.catch(error => console.error('Error:', error));
