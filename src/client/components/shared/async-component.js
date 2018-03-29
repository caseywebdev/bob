import _ from 'underscore';
import Loading from './loading';
import React from 'react';

export default class extends React.Component {
  state = {};

  async componentDidMount() {
    const {default: Component} = await this.props.loader();
    this.setState({Component});
  }

  render() {
    const props = _.omit(this.props, 'loader');
    const {Component} = this.state;
    return Component ? <Component {...props} /> : <Loading />;
  }
}
