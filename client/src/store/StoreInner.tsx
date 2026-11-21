import { Provider } from 'react-redux';
import { store } from './store';
import App from '../App';

/**
 * Wraps the entire App with the Redux Provider.
 * This file is the ONLY place that statically imports the store and all slices.
 * Because it is dynamically imported from main.tsx, Vite splits it (and Redux
 * Toolkit, react-redux, all slices) into a separate vendor chunk — keeping
 * them out of the initial download so the shell paints before Redux loads.
 */
export default function StoreInner() {
  return <Provider store={store}><App data-icod-id="src_store_storeinner_tsx_7fcf" /></Provider>;
}
