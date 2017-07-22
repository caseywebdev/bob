import _ from 'underscore';
import React, {Component} from 'react';

let components = [];

export default class extends Component {
  componentWillMount() {
    components.push(this);
  }

  componentDidMount() {
    this.updateTitle();
  }

  componentDidUpdate() {
    this.updateTitle();
  }

  componentWillUnmount() {
    components = _.without(components, this);
  }

  updateTitle() {
    document.title = _.chain(components)
      .map(({props: {title}}) => title)
      .compact()
      .reverse()
      .join(' | ')
      .value();
  }

  render() {
    return React.Children.only(this.props.children);
  }
}
