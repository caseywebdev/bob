import _ from 'underscore';
import Loading from './loading';
import React from 'react';

export default class extends React.Component {
  state = {};

  async componentWillMount() {
    const {default: Component} = await this.props.importGetter();
    this.setState({Component});
  }

  render() {
    const props = _.omit(this.props, 'importGetter');
    const {Component} = this.state;
    return Component ? <Component {...props} /> : <Loading />;
  }
}
