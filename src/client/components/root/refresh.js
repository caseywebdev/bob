import {Component} from 'react';

export default class extends Component {
  componentWillMount() {
    this.props.history.replace('/');
  }

  render() {
    return null;
  }
}
