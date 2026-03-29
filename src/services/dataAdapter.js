import { firebaseAdapter } from './adapters/firebaseAdapter';
import { djangoAdapter } from './adapters/djangoAdapter';

/**
 * Pluggable data adapter layer.
 * Default: Firebase for current deployed app.
 * Future: switch to Django by setting VITE_DATA_ADAPTER=django.
 */
const adapterName = (import.meta.env.VITE_DATA_ADAPTER || 'firebase').toLowerCase();

export const dataAdapter = adapterName === 'django' ? djangoAdapter : firebaseAdapter;

export const isFirebaseAdapter = adapterName === 'firebase';
export const isDjangoAdapter = adapterName === 'django';
