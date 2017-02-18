//React, ReactDOM and react-router are being served as a static route for node_modules
import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, hashHistory, IndexRoute} from 'react-router';
import App from './components/App';
import Initial from './components/Initial';
import Donor from './components/Donor';
import Patient from './components/Patient';

const routes = <Route component={App}>
<Route path="/" component={Initial} />
<Route path="/patient" component={Patient} />
<Route path="/donor" component={Donor} />
</Route>

ReactDOM.render(
	<Router history={hashHistory}>{routes}</Router>, 
	document.getElementById('app')
);