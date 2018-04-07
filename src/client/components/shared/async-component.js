import Center from './center';
import Loading from './loading';
import Notice from './notice';
import React from 'react';

export default class extends React.Component {
  state = {};

  async componentDidMount() {
    try {
      const {default: Component} = await this.props.importComponent();
      this.setState({Component});
    } catch (er) {
      this.setState({error: er});
    }
  }

  render() {
    const {Component, error} = this.state;

    if (Component) return <Component {...this.props.props} />;

    if (error) {
      return <Center><Notice type='error'>{error.toString()}</Notice></Center>;
    }

    return <Center><Loading size='large' /></Center>;
  }
}
