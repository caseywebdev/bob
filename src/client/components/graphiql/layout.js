import Meta from '../shared/meta';
import React, {Component} from 'react';

export default class extends Component {
  state = {};

  componentWillMount() {
    import('./index').then(({default: Index}) => this.setState({Index}));
  }

  render() {
    const {Index} = this.state;

    return (
      <Meta title='GraphiQL'>
        {Index ? <Index /> : 'Loading...'}
      </Meta>
    );
  }
}
