import React from "react";
import { getAvatar, formatTime } from "../hooks/messageUtils.js";
import "../styles/MsgChatWindow.css";
import { FaTrash } from "react-icons/fa";

export default function MsgChatWindow({
  selectedChat,
  messages,
  inputText,
  isTyping,
  onlineUsers,
  sending,
  contextMenu,
  socket,
  myId,
  chatBodyRef,
  inputRef,
  loadingChat,
  onBack,
  onInputChange,
  onSend,
  onBubbleClick,
  onDeleteMessage,
  onDeleteChatClick,
}) {
  return (
    <main className="msg-chat-window">
      {/* ── Chat Header ── */}
      <div className="msg-chat-header">
        <button className="msg-back-btn" onClick={onBack}>
          ‹
        </button>
        <div className="msg-avatar-wrap">
          <img
            src={getAvatar(selectedChat.user)}
            alt=""
            className="msg-avatar"
          />
          {onlineUsers.has(selectedChat.user.userId) && (
            <span className="msg-online-dot" />
          )}
        </div>
        <div className="msg-chat-header-info">
          <h4>{selectedChat.user.name}</h4>
          <p>
            {isTyping ? (
              <span className="msg-typing-label">typing...</span>
            ) : onlineUsers.has(selectedChat.user.userId) ? (
              <span className="msg-online-label"></span>
            ) : (
              <span className="msg-offline-label"></span>
            )}
          </p>
        </div>
        {socket?.connected && (
          <span className="msg-connected-dot" title="Connected" />
        )}
        <button
          className="msg-delete-chat-btn"
          onClick={onDeleteChatClick}
          title="Delete conversation"
        >
          <FaTrash style={{color:"white"}}/>
        </button>
      </div>

      {/* ── Chat Body ── */}
      <div className="msg-chat-body" ref={chatBodyRef}>
        {loadingChat ? (
          <div className="msg-chat-state">
            <div className="msg-spinner" />
            <span>Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="msg-chat-state">
            <span style={{ fontSize: "2rem" }}>👋</span>
            <p>
              Say hello to <strong>{selectedChat.user.name}</strong>
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const mine = msg.senderId === myId;
            return (
              <div
                key={msg._id}
                className={`msg-bubble-row ${mine ? "mine" : "theirs"}`}
              >
                {!mine && (
                  <img
                    src={getAvatar(selectedChat.user)}
                    alt=""
                    className="msg-bubble-avatar"
                  />
                )}
                <div className="msg-bubble-wrapper">
                  <div
                    className={`msg-bubble ${mine ? "out" : "in"} ${msg._temp ? "temp" : ""}`}
                    onClick={() =>
                      !msg._temp &&
                      onBubbleClick(
                        contextMenu?.msgId === msg._id
                          ? null
                          : { msgId: msg._id, inline: true, mine },
                      )
                    }
                  >
                    <span className="msg-text">{msg.text}</span>
                    <span className="msg-meta">
                      {formatTime(msg.createdAt)}
                      {mine && (
                        <span className={`msg-tick ${!msg._temp && msg.read ? "msg-tick--read" : ""}`}>
                          {msg._temp ? " ○" : msg.read ? " ✓✓" : " ✓✓"}
                        </span>
                      )}
                    </span>
                  </div>
                  {contextMenu?.msgId === msg._id &&
                    contextMenu?.inline &&
                    !msg._temp && (
                      <button
                        className="msg-inline-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteMessage(msg._id, mine);
                        }}
                      >
                         Delete
                      </button>
                    )}
                </div>
              </div>
            );
          })
        )}

        {/* Typing dots */}
        {isTyping && (
          <div className="msg-bubble-row theirs">
            <img
              src={getAvatar(selectedChat.user)}
              alt=""
              className="msg-bubble-avatar"
            />
            <div className="msg-bubble in msg-typing-bubble">
              <span className="msg-typing-dots">
                <span />
                <span />
                <span />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Chat Footer ── */}
      <div className="msg-chat-footer">
        <input
          ref={inputRef}
          type="text"
          className="msg-input"
          placeholder="Type a message..."
          value={inputText}
          onChange={onInputChange}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSend()}
          maxLength={1000}
        />
        <button
          className={`msg-send-btn ${sending ? "sending" : ""}`}
          onClick={onSend}
          disabled={!inputText.trim() || sending}
        >
          {sending ? <span className="msg-spinner-sm" /> : "➤"}
        </button>
      </div>
    </main>
  );
}
