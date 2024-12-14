import React from "react";
import styled from "styled-components";

const rooms = ["general", "random", "jokes", "javascript"];

const Container = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
`;

const SideBar = styled.div`
  height: 100%;
  width: 15%;
  border-right: 1px solid black;
`;

const ChatPanel = styled.div`
  height: 100%;
  width: 85%;
  display: flex;
  flex-direction: column;
`;

const BodyContainer = styled.div`
  width: 100%;
  height: 75%;
  overflow-y: scroll;
  border-bottom: 1px solid black;
`;

const TextBox = styled.textarea`
  height: 15%;
  width: 100%;
  resize: none;
`;

const ChannelInfo = styled.div`
  height: 10%;
  width: 100%;
  border-bottom: 1px solid black;
  display: flex;
  align-items: center;
  padding: 0 10px;
  font-weight: bold;
`;

const Row = styled.div`
  cursor: pointer;
  padding: 10px;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const Messages = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10px;
`;

function Chat(props) {
  function renderRooms(room) {
    const currentChat = {
      chatname: room,
      isChannel: true,
      receiverId: "",
    };
    return (
      <Row onClick={() => props.toggleChat(currentChat)} key={room}>
        {room}
      </Row>
    );
  }

  function renderUser(user) {
    if (user.id === props.yourId) {
      return <Row key={user.id}>You: {user.username}</Row>;
    }
    const currentChat = {
      chatname: user.username,
      isChannel: false,
      receiverId: user.id,
    };
    return (
      <Row
        onClick={() => {
          props.toggleChat(currentChat);
        }}
        key={user.id}
      >
        {user.username}
      </Row>
    );
  }

  function renderMessages(message, index) {
    return (
      <div key={index} style={{ marginBottom: "10px" }}>
        <h4 style={{ margin: "0 0 5px" }}>{message.sender}</h4>
        <p style={{ margin: 0 }}>{message.content}</p>
      </div>
    );
  }

  let body;
  if (!props.currentChat.isChannel || props.connectedRooms.includes(props.currentChat.chatname)) {
    body = <Messages>{props.messages.map(renderMessages)}</Messages>;
  } else {
    body = (
      <button onClick={() => props.joinRoom(props.currentChat.chatname)}>
        Join {props.currentChat.chatname}
      </button>
    );
  }

  function handleKeyPress(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      props.sendMessage();
    }
  }

  return (
    <Container>
      <SideBar>
        <h3>Channels</h3>
        {rooms.map(renderRooms)}
        <h3>All Users</h3>
        {props.allUsers.map(renderUser)}
      </SideBar>
      <ChatPanel>
        <ChannelInfo>{props.currentChat.chatname}</ChannelInfo>
        <BodyContainer>{body}</BodyContainer>
        <TextBox
          value={props.message}
          onChange={props.handleMessageChange}
          onKeyPress={handleKeyPress}
          placeholder="Say something..."
        />
      </ChatPanel>
    </Container>
  );
}

export default Chat;
