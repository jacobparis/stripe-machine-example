import "./index.scss"

import "core-js/stable"
import "regenerator-runtime/runtime"

import * as React from "react"
import ReactDOM from "react-dom"

import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

import HomeScene from "./scenes/home"

const stripePromise = loadStripe("pk_test_Bq9vSRu57qWx8kaCfSoO0Vv800egpSYOwe")

function App() {
    return (
        <Elements stripe={stripePromise}>
            <HomeScene />
        </Elements>
    )
}

ReactDOM.render(<App />, document.getElementById("root"))
