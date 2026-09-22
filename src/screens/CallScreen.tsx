import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import peerService from '../services/peer';
import socketService from '../services/socket';

const CallScreen = ({ route, navigation }: any) => {
  const { ticketId, callType = 'video' } = route.params;
  const { user } = useAuth();
  const [status, setStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [duration, setDuration] = useState(0);
  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(callType === 'video');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    init();
    return () => cleanup();
  }, []);

  useEffect(() => {
    if (status === 'connected') {
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  const init = async () => {
    try {
      const stream = await peerService.getLocalStream(callType === 'video', true);
      setLocalStream(stream);

      peerService.onIncomingCall = async (call: any) => {
        const remote = await peerService.answerCall(call, stream);
        setRemoteStream(remote);
        setStatus('connected');
      };

      // Auto-connect si on est le client (pas de targetUserId ici, on utilise le socket)
      setTimeout(() => setStatus('connected'), 2000);
    } catch (e) {
      Alert.alert('Erreur', "Caméra/micro non disponible");
      navigation.goBack();
    }
  };

  const cleanup = () => {
    localStream?.getTracks().forEach((t: any) => t.stop());
    peerService.endCall();
  };

  const endCall = () => {
    cleanup();
    navigation.goBack();
  };

  const toggleMute = () => {
    localStream?.getAudioTracks()[0] && (localStream.getAudioTracks()[0].enabled = !muted);
    setMuted(!muted);
  };

  const toggleVideo = () => {
    localStream?.getVideoTracks()[0] && (localStream.getVideoTracks()[0].enabled = !videoOn);
    setVideoOn(!videoOn);
  };

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      <View style={styles.remote}>
        {remoteStream ? (
          <RTCView streamURL={remoteStream.toURL()} style={styles.video} objectFit="cover" />
        ) : (
          <View style={styles.waiting}>
            <Icon name="phone" size={60} color="#e94560" />
            <Text style={styles.waitingText}>{status === 'connecting' ? 'Connexion...' : 'Appel terminé'}</Text>
            {status === 'connected' && <Text style={styles.timer}>{fmt(duration)}</Text>}
          </View>
        )}
      </View>

      {videoOn && localStream && (
        <View style={styles.pip}>
          <RTCView streamURL={localStream.toURL()} style={styles.video} objectFit="cover" mirror />
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity style={[styles.ctrl, muted && styles.ctrlActive]} onPress={toggleMute}>
          <Icon name={muted ? 'microphone-off' : 'microphone'} size={26} color="#fff" />
        </TouchableOpacity>
        {callType === 'video' && (
          <TouchableOpacity style={[styles.ctrl, !videoOn && styles.ctrlActive]} onPress={toggleVideo}>
            <Icon name={videoOn ? 'video' : 'video-off'} size={26} color="#fff" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.endBtn} onPress={endCall}>
          <Icon name="phone-hangup" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  remote: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' },
  video: { width: '100%', height: '100%' },
  waiting: { alignItems: 'center' },
  waitingText: { color: '#fff', fontSize: 18, marginTop: 15 },
  timer: { color: '#888', fontSize: 14, marginTop: 8 },
  pip: { position: 'absolute', top: Platform.OS === 'ios' ? 55 : 35, right: 15, width: 110, height: 150, borderRadius: 10, overflow: 'hidden', borderWidth: 2, borderColor: '#fff' },
  controls: { flexDirection: 'row', justifyContent: 'center', gap: 20, paddingVertical: 35, paddingBottom: Platform.OS === 'ios' ? 55 : 35, backgroundColor: 'rgba(0,0,0,0.8)' },
  ctrl: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  ctrlActive: { backgroundColor: '#e94560' },
  endBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#dc3545', justifyContent: 'center', alignItems: 'center' },
});

export default CallScreen;
