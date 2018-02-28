import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { AppContainer } from 'react-hot-loader';

import ExampleView from './components/example.component';

import './app.component.scss';
import './images/favicon.ico';

const renderApp = (Component) => {
  render(
    <AppContainer>
      <Router>
        <Route path="/" component={Component} />
      </Router>
    </AppContainer>,
    document.getElementById('oc-examples'),
  );
};

renderApp(ExampleView);

// Webpack Hot Module Replacement API
/* eslint-disable global-require */
if (module.hot) {
  module.hot.accept('./components/example.component', () => {
    const Comp = require('./components/example.component').default;
    renderApp(Comp);
  });
}
