import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator} from 'firebase/storage';

const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_AUTH_DOMAIN",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_STORAGE_BUCKET",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID",
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Conectar con los emuladores solo si estás en desarrollo
if (__DEV__) {
    connectAuthEmulator(auth, "http://10.0.2.2:9099");
    connectFirestoreEmulator(db, "10.0.2.2", 8080);
    connectStorageEmulator(storage, "10.0.2.2", 9199);
    console.log('Conectado al emulador de Firebase');
}