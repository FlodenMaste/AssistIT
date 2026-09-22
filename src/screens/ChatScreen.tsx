import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../services/api';

const ChatScreen = ({ route }: any) => {
  const { ticketId } = route.params;
  const { user, socket } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
    socket.joinTicket(ticketId);

    const onMessage = (msg: any) => setMessages((prev) => [...prev, msg]);
    socket.on('chat-message', onMessage);

    return () => {
      socket.leaveTicket(ticketId);
      socket.off('chat-message', onMessage);
    };
  }, [ticketId]);

  const loadMessages = async () => {
    try {
      const res = await chatAPI.getMessages(ticketId);
      setMessages(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    const msg = { expediteur_id: user?.id, contenu: text.trim(), expediteur_nom: user?.nom, expediteur_role: user?.role, created_at: new Date().toISOString() };
    setText('');

    // Optimistic update
    setMessages((prev) => [...prev, msg]);

    try {
      await chatAPI.sendMessage(ticketId, msg.contenu);
    } catch (e) {
      console.error(e);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMine = item.expediteur_id === user?.id;
    return (
      <View style={[styles.bubble, isMine ? styles.mine : styles.other]}>
        {!isMine && <Text style={styles.sender}>{item.expediteur_nom}</Text>}
        <Text style={[styles.msgText, isMine && { color: '#fff' }]}>{item.contenu}</Text>
        <Text style={[styles.time, isMine && { color: 'rgba(255,255,255,0.6)' }]}>
          {new Date(item.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color="#e94560" /></View>;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{ padding: 15 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputRow}>
        <TextInput style={styles.input} placeholder="Message..." placeholderTextColor="#666"
          value={text} onChangeText={setText} multiline />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={{ color: '#fff', fontSize: 18 }}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 14, marginBottom: 10 },
  mine: { alignSelf: 'flex-end', backgroundColor: '#e94560', borderBottomRightRadius: 4 },
  other: { alignSelf: 'flex-start', backgroundColor: '#16213e', borderBottomLeftRadius: 4 },
  sender: { fontSize: 11, color: '#17a2b8', fontWeight: 'bold', marginBottom: 3 },
  msgText: { fontSize: 15, color: '#fff', lineHeight: 20 },
  time: { fontSize: 10, color: '#888', marginTop: 4, alignSelf: 'flex-end' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 10, backgroundColor: '#16213e', borderTopWidth: 1, borderTopColor: '#333' },
  input: { flex: 1, backgroundColor: '#1a1a2e', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, color: '#fff', maxHeight: 100, marginRight: 10 },
  sendBtn: { backgroundColor: '#e94560', borderRadius: 20, padding: 10, width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
});

export default ChatScreen;
