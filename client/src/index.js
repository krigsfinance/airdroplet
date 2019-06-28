import React from 'react';
import ReactDOM from 'react-dom';
import Airdroplet from './airdroplet';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<Airdroplet />, document.getElementById('root'));

serviceWorker.unregister();
