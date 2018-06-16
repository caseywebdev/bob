import {ApolloProvider} from 'react-apollo';
import {Route, Router, Switch} from 'react-router-dom';
import apolloClient from '../constants/apollo-client';
import createAsyncComponent from '../functions/create-async-component';
import disk from '../constants/disk';
import history from '../constants/history';
import Meta from './shared/meta';
import React, {Component} from 'react';

const GraphiQL = createAsyncComponent(() => import('./graphiql'));
const Main = createAsyncComponent(() => import('./main'));

export default class extends Component {
  state = {
    token: disk.get('token')
  }

  handleMessage = ({data: {name}}) => {
    if (name === 'token-updated') this.setState({token: disk.get('token')});
  }

  componentDidMount() {
    window.addEventListener('message', this.handleMessage);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleMessage);
  }

  render() {
    return (
      <ApolloProvider client={apolloClient} key={this.state.token}>
        <Router {...{history}}>
          <Meta title='Bob'>
            <Switch>
              <Route exact path='/graphiql' component={GraphiQL} />
              <Route component={Main} />
            </Switch>
          </Meta>
        </Router>
      </ApolloProvider>
    );
  }
}
