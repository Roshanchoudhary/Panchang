'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/useAuth';
import AuthGuard from '@/components/AuthGuard';

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const bottomRef = useRef();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'chats'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach((doc) => msgs.push({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await addDoc(collection(db, 'chats'), {
      text: newMessage,
      uid: user.uid,
      name: user.displayName || 'अतिथि',
      timestamp: serverTimestamp()
    });
    setNewMessage('');
  };

  return (
    <AuthGuard>
      <div style={{ maxWidth: 700, margin: '20px auto', background: 'white', borderRadius: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.10)', overflow: 'hidden' }}>
        <div style={{ background: '#6B2A1E', color: 'white', padding: 16, textAlign: 'center', fontWeight: 700, fontSize: '1.2rem' }}>
          💬 मैथिली पंचांग चैट
        </div>
        <div style={{ height: 400, overflowY: 'auto', padding: 16, background: '#f9f6f0' }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ margin: '6px 0', textAlign: msg.uid === user?.uid ? 'right' : 'left' }}>
              <span style={{ background: msg.uid === user?.uid ? '#6B2A1E' : '#e8e0d8', color: msg.uid === user?.uid ? 'white' : '#2D1B12', padding: '6px 14px', borderRadius: 16, display: 'inline-block', maxWidth: '80%', wordBreak: 'break-word' }}>
                <strong>{msg.name}:</strong> {msg.text}
              </span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={sendMessage} style={{ display: 'flex', padding: 12, background: 'white', borderTop: '1px solid #eee' }}>
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="संदेश लिखें..." style={{ flex: 1, padding: 10, border: '1px solid #ddd', borderRadius: 8, marginRight: 8 }} />
          <button type="submit" style={{ padding: '10px 20px', background: '#6B2A1E', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>भेजें</button>
        </form>
      </div>
    </AuthGuard>
  );
}
