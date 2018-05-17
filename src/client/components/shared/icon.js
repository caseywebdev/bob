import React from 'react';
import {library} from '@fortawesome/fontawesome-svg-core';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import {faBan} from '@fortawesome/free-solid-svg-icons/faBan';
import {faBriefcase} from '@fortawesome/free-solid-svg-icons/faBriefcase';
import {faCheckCircle} from '@fortawesome/free-solid-svg-icons/faCheckCircle';
import {faClock} from '@fortawesome/free-solid-svg-icons/faClock';
import {faDownload} from '@fortawesome/free-solid-svg-icons/faDownload';
import {faExclamationCircle} from '@fortawesome/free-solid-svg-icons/faExclamationCircle';
import {faRedo} from '@fortawesome/free-solid-svg-icons/faRedo';
import {faUpload} from '@fortawesome/free-solid-svg-icons/faUpload';
import {faWrench} from '@fortawesome/free-solid-svg-icons/faWrench';

library.add(
  faBan,
  faBriefcase,
  faCheckCircle,
  faClock,
  faDownload,
  faExclamationCircle,
  faRedo,
  faUpload,
  faWrench
);

export default props => <FontAwesomeIcon {...props} />;
