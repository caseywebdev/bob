import React, {Component} from 'react';

export default class extends Component {
  state = {};

  componentWillMount() {
    import('./index').then(({default: Index}) => this.setState({Index}));
  }

  render() {
    const {Index} = this.state;
    if (Index) return <Index />;

    return <div>Loading...</div>;
  }
}
