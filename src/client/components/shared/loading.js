import cx from 'classnames';
import React, {Component} from 'react';
import styles from './loading.scss';

const SHOW_DELAY = 0.25;

export default class extends Component {
  state = {
    visible: false
  }

  show = () => {
    this.setState({visible: true});
  }

  componentDidMount() {
    this.timeoutId = setTimeout(this.show, SHOW_DELAY * 1000);
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutId);
  }

  render() {
    const {props: {size}, state: {visible}} = this;
    const className =
      cx(styles.root, styles[`size-${size}`], {[styles.visible]: visible});
    return <div {...{className}}><div /><div /><div /></div>;
  }
}
