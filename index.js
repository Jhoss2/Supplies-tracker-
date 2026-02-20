import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json'; // Ceci va chercher "SuppliesTracker" automatiquement

AppRegistry.registerComponent(appName, () => App);
