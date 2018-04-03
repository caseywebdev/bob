import Center from './center';
import Loading from './loading';
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
    return (
      Component ? <Component {...this.props.props} /> :
      error ? <Center>{error.toString()}</Center> :
      <Center><Loading size='large' /></Center>
    );
  }
}
