import {render} from 'react-dom';
import createAsyncComponent from '../functions/create-async-component';
import React from 'react';

const Root = createAsyncComponent(() => import('../components/root'));

render(<Root />, document.getElementById('root'));
