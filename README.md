# Stripe Machine Example

An animated stripe checkout using XState and React. This uses the Stripe API and the Stripe Elements tools to create an actual payment. You can swap out the test keys for your own keys and and accept payments with this code.

Backend is provided via a Netlify Function

# Demo

![ezgif-6-962f898f1d51](https://user-images.githubusercontent.com/5633704/82744168-cbc04800-9d42-11ea-8f18-70592639b014.gif)

# State Machine

Using XState to handle application logic is a very effective pattern that leaves React in charge of nothing more than rendering UI. All of the logic to instantiate the stripe API and orchestrate its requests is handled by the state machine.

![Screen Shot 2020-05-23 at 10 08 27 PM](https://user-images.githubusercontent.com/5633704/82744117-3a50d600-9d42-11ea-9d1f-70e32dfd9c0d.png)

# Usage

Clone this repository to your local environment

```sh
git clone https://github.com/jacobparis/stripe-machine-example my-project
```

Install node modules

```sh
npm install
```

Replace Stripe keys in `functions/create-customer.js` with your own stripe keys

# Commands

* `npm run build` to compile and drop the bundle in the `dist` directory

* `npm run serve` to start a local webserver
