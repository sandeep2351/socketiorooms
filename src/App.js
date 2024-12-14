import React, { useState, useRef, useEffect } from 'react';
import Form from './components/UsernameForm';
import Chat from './components/Chat';
import io from 'socket.io-client';
import { produce } from 'immer'; // Correct import

import './App.css';

const initialMessagesState = {
  general: [],
  random: [],
  jokes: [],
  javascript: [],
};

function App() {
  const [username, setUsername] = useState('');
  const [connected, setConnected] = useState(false);
  const [currentChat, setCurrentChat] = useState({ isChannel: true, chatname: 'general', receiverId: '' });
  const [connectedRooms, setConnectedRooms] = useState(['general']);
  const [allUsers, setAllUsers] = useState([]);
  const [messages, setMessages] = useState(initialMessagesState);
  const [message, setMessage] = useState('');
  const socketRef = useRef();

  function handleMessageChange(e) {
    setMessage(e.target.value);
  }

  function sendMessage() {
    if (!message.trim()) return; // Prevent sending empty messages
    const payload = {
      content: message,
      to: currentChat.isChannel ? currentChat.chatname : currentChat.receiverId,
      sender: username,
      chatname: currentChat.chatname,
      isChannel: currentChat.isChannel,
    };
    socketRef.current.emit('send message', payload);

    const newMessages = produce(messages, draft => {
      draft[currentChat.chatname].push({
        sender: username,
        content: message,
      });
    });
    setMessages(newMessages);
    setMessage('');
  }

  function roomJoinCallback(incomingMessages, room) {
    const newMessages = produce(messages, draft => {
      draft[room] = incomingMessages;
    });
    setMessages(newMessages);
  }

  function joinRoom(room) {
    if (connectedRooms.includes(room)) return; // Avoid joining the same room multiple times
    const newConnectedRooms = produce(connectedRooms, draft => {
      draft.push(room);
    });
    socketRef.current.emit('join room', room, messages => roomJoinCallback(messages, room));
    setConnectedRooms(newConnectedRooms);
  }

  function toggleChat(chat) {
    if (!messages[chat.chatname]) {
      const newMessages = produce(messages, draft => {
        draft[chat.chatname] = [];
      });
      setMessages(newMessages);
    }
    setCurrentChat(chat);
  }

  function handleChange(e) {
    setUsername(e.target.value);
  }

  function connect() {
    if (!username.trim()) return; // Prevent connecting with an empty username
    setConnected(true);
    socketRef.current = io.connect('/');

    socketRef.current.emit('join server', username);
    socketRef.current.emit('join room', 'general', messages => roomJoinCallback(messages, 'general'));

    socketRef.current.on('new user', allUsers => {
      setAllUsers(allUsers);
    });

    socketRef.current.on('new message', ({ content, sender, chatname }) => {
      setMessages(messages => {
        const newMessages = produce(messages, draft => {
          if (draft[chatname]) {
            draft[chatname].push({ content, sender });
          } else {
            draft[chatname] = [{ content, sender }];
          }
        });
        return newMessages;
      });
    });
  }

  useEffect(() => {
    setMessage('');
  }, [messages]);

  let body;
  if (connected) {
    body = (
      <Chat
        message={message}
        handleMessageChange={handleMessageChange}
        sendMessage={sendMessage}
        yourId={socketRef.current ? socketRef.current.id : ''}
        allUsers={allUsers}
        joinRoom={joinRoom}
        connectedRooms={connectedRooms}
        currentChat={currentChat}
        toggleChat={toggleChat}
        messages={messages[currentChat.chatname] || []}
      />
    );
  } else {
    body = (
      <Form
        username={username}
        onChange={handleChange}
        connect={connect}
      />
    );
  }

  return (
    <div className="App">
      {body}
    </div>
  );
}

export default App;
