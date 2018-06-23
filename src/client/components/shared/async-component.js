import Center from './center';
import Loading from './loading';
import Notice from './notice';
import React from 'react';

export default class extends React.Component {
  state = {};

  async componentDidMount() {
    try {
      const {importComponent} = this.props;
      const {default: Component} = await importComponent();
      this.setState({Component});
    } catch (er) {
      this.setState({error: er});
    }
  }

  render() {
    const {props: {componentProps}, state: {Component, error}} = this;

    if (Component) return <Component {...componentProps} />;

    if (error) {
      return <Center><Notice type='error'>{error.toString()}</Notice></Center>;
    }

    return <Center><Loading size='large' /></Center>;
  }
}
