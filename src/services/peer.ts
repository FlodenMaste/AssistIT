import { PEER_CONFIG } from '../config/api';

class PeerService {
  private peer: any = null;
  private currentCall: any = null;
  private initialized = false;
  private userId: number | null = null;
  public onIncomingCall: ((call: any) => void) | null = null;

  // Ne pas créer de Peer au démarrage — juste stocker l'userId
  initialize(userId: number): Promise<string> {
    this.userId = userId;
    this.initialized = true;
    // Pas de Peer tant qu'on n'a pas besoin d'appels
    return Promise.resolve('ok');
  }

  // Créer le Peer lazily quand on en a besoin
  private ensurePeer(): Promise<void> {
    return new Promise((resolve) => {
      if (this.peer?.id) {
        resolve();
        return;
      }

      try {
        // Import dynamique pour éviter les erreurs au chargement
        const PeerConstructor = require('peerjs').default;
        this.peer = new PeerConstructor(`assistit_${this.userId}`, {
          host: PEER_CONFIG.host,
          port: PEER_CONFIG.port,
          path: '/peerjs',
          secure: false,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
            ],
          },
        });

        this.peer.on('open', (id: string) => {
          console.log('📹 Peer ID:', id);
          resolve();
        });

        this.peer.on('call', (call: any) => {
          console.log('📹 Appel entrant de:', call.peer);
          this.currentCall = call;
          if (this.onIncomingCall) {
            this.onIncomingCall(call);
          }
        });

        this.peer.on('error', (err: any) => {
          console.warn('Peer error:', err?.type || err?.message || 'unknown');
        });

        // Timeout — résoudre quand même pour ne pas bloquer
        setTimeout(() => {
          resolve();
        }, 5000);
      } catch (e) {
        console.warn('Peer creation error:', e);
        resolve(); // Ne jamais reject
      }
    });
  }

  async callUser(targetUserId: number, stream: MediaStream, callType = 'video') {
    await this.ensurePeer();
    if (!this.peer) throw new Error('Peer non disponible');

    const call = this.peer.call(`assistit_${targetUserId}`, stream, {
      metadata: { callType },
    });

    return new Promise<MediaStream>((resolve, reject) => {
      if (!call) return reject(new Error('Échec de l\'appel'));
      this.currentCall = call;
      call.on('stream', (remoteStream: MediaStream) => resolve(remoteStream));
      call.on('error', (err: any) => reject(err));
    });
  }

  async answerCall(call: any, stream: MediaStream) {
    call.answer(stream);
    return new Promise<MediaStream>((resolve, reject) => {
      call.on('stream', (remoteStream: MediaStream) => resolve(remoteStream));
      call.on('error', (err: any) => reject(err));
    });
  }

  endCall() {
    try {
      if (this.currentCall && typeof this.currentCall.close === 'function') {
        this.currentCall.close();
      }
    } catch (e) {
      // Ignorer
    }
    this.currentCall = null;
  }

  async getLocalStream(video = true, audio = true) {
    if (!navigator?.mediaDevices?.getUserMedia) {
      throw new Error('Media non disponible sur cet appareil');
    }
    return navigator.mediaDevices.getUserMedia({
      audio,
      video: video ? { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } : false,
    });
  }

  async getScreenStream() {
    if (!navigator?.mediaDevices?.getDisplayMedia) {
      throw new Error('Partage d\'écran non disponible');
    }
    return navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
  }

  destroy() {
    try {
      this.endCall();
      if (this.peer && typeof this.peer.destroy === 'function') {
        this.peer.destroy();
      }
    } catch (e) {
      // Ignorer les erreurs de destruction
    }
    this.peer = null;
    this.userId = null;
    this.initialized = false;
  }
}

const peerService = new PeerService();
export default peerService;
