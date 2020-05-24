const Stripe = require('stripe')
// TODO: REPLACE WITH TEST KEY
// const stripe = Stripe('sk_test_asdfasdfasdfasdfasdf')

exports.handler = async function createCustomer(req) {
  const { body } = JSON.parse(req.body)

  try {
    var customer = await stripe.customers.create({
      payment_method: body.payment_method,
      email: 'jenny.rosen@example.com',
      invoice_settings: {
        default_payment_method: body.payment_method,
      },
    })
  } catch (error) {
    return {
      statusCode: error.statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(error)
    }
  }

  try {
    var subscription = await stripe.subscriptions.create({
      customer: customer.id,
      // TODO: REPLACE WITH TEST PLAN
      items: [{ plan: "plan_ASDFSFSDF" }],
      expand: ["latest_invoice.payment_intent"]
    })
  } catch (error) {
    return {
      statusCode: error.statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(error)
    }
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ customer, subscription })
  }
}
