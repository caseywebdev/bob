import {CANCELLED, FAILED, SUCCEEDED} from '../constants/statuses';

export default ({build: {status}}) =>
  status === CANCELLED ||
  status === FAILED ||
  status === SUCCEEDED;
