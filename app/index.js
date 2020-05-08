import "./index.scss"

import React from "react"
import ReactDOM from "react-dom"
import { BrowserRouter as Router, Route, Switch, Redirect} from "react-router-dom"

import HomeScene from "./scenes/home"

function App() {
    return (
        <Router>
            <Switch>
                <Route path="/home" component={HomeScene} />
                <Redirect from="/" to="/home" />
            </Switch>
        </Router>
    )
}

ReactDOM.render(<App />, document.getElementById("root"))
