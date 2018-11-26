'use strict';

import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autocomplete from  './modules/autocomplete';
import typeAhead from './modules/typeAhead';

// disabled while connection is not available !!!
// autocomplete($('#address'), $('#lat'), $('#lng'));

typeAhead( $('.search') );
