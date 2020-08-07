import React from 'react';
import { HashRouter, Switch, Route, Redirect } from 'react-router-dom';

import Login from './pages/login';
import Configuration from './pages/configuration';
import UserManagement from './pages/userManagement';
import SignalConfiguration from './pages/signalConfiguration';
import AdminSettings from './pages/adminSettings';
import SystemSettings from './pages/systemSettings';

export default function Routes() {
	return (
		<HashRouter>
			<Switch>
				<Route path='/' exact component={Login}></Route>
				<Route path='/configuration' component={Configuration}></Route>
				<Route path='/userManagement/:id/:email/:password/:mode/:balance' component={UserManagement}></Route>
				<Route path='/signalConfiguration/:id/:email/:password/:mode/:balance' component={SignalConfiguration}></Route>
				<Route path='/adminSettings/:id/:email/:password/:mode/:balance' component={AdminSettings}></Route>
				<Route path='/systemSettings/:id' component={SystemSettings}></Route>
				<Route render={() => <Redirect to="/" />} />
			</Switch>
		</HashRouter>
	);
}   