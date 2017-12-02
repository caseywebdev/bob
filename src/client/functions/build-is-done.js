import {CANCELLED, FAILED, SUCCEEDED} from '../../shared/constants/statuses';

export default ({build: {status}}) =>
  status === CANCELLED ||
  status === FAILED ||
  status === SUCCEEDED;
