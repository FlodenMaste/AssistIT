import { Platform } from 'react-native';

const API_BASE = Platform.select({
  android: 'http://localhost:4000',
  ios: 'http://localhost:4000',
  default: 'http://localhost:4000',
});

const SOCKET_URL = API_BASE;

const PEER_CONFIG = Platform.select({
  android: { host: 'localhost', port: 4000 },
  ios: { host: 'localhost', port: 4000 },
  default: { host: 'localhost', port: 4000 },
});

const MINIO_URL = Platform.select({
  android: 'http://localhost:9000/assistit-files',
  ios: 'http://localhost:9000/assistit-files',
  default: 'http://localhost:9000/assistit-files',
});

export { API_BASE, SOCKET_URL, PEER_CONFIG, MINIO_URL };
