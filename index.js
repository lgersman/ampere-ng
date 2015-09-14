import Ampere from './src/ampere';
import Logger from './src/logger';

const fs = require('fs');

export Logger from './src/logger';

const package_json = JSON.parse(fs.readFileSync(`${__dirname}/package.json`, 'utf8'));

Object.defineProperty(Ampere, 'VERSION', {
  value       : package_json.version,
  writable    : false,
  configurable: false
});

export default Ampere;

export App from './src/app';
export View from './src/view';
export Constants from './src/constants';
export Logger from './src/logger';
export Ui from './src/ui';

Logger(package_json.name).info(`version=${Ampere.VERSION}`);
