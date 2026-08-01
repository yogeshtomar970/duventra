import React from "react";
import BottomNav from "../component/BottomNav";
// ── Hook ──────────────────────────────────────
import useMessagePage from "../hooks/useMessagePage.js";

// ── Sub-components ────────────────────────────
import MsgSidebar from "./MsgSidebar.jsx";
import MsgChatWindow from "./MsgChatWindow.jsx";
import MsgEmptyState from "./MsgEmptyState.jsx";
import MsgDeleteModal from "./MsgDeleteModal.jsx";

// ── Global styles ─────────────────────────────
import "../styles/MessageCard.css";

export default function MessageCard() {
  const {
    myId,
    socket,
    inbox,
    selectedChat,
    messages,
    inputText,
    search,
    searchResults,
    showSearch,
    isTyping,
    onlineUsers,
    lastSeenMap,
    loadingInbox,
    loadingChat,
    loadingSearch,
    sending,
    contextMenu,
    showDeleteConfirm,
    chatBodyRef,
    inputRef,
    setSearch,
    setShowSearch,
    setSearchResults,
    setContextMenu,
    setShowDeleteConfirm,
    openChat,
    handleSend,
    handleInputChange,
    handleBack,
    handleDeleteConversation,
    handleDeleteMessage,
  } = useMessagePage();

  return (
    <div className="msg-page">
      {/* ── Sidebar (inbox + search) ── */}
      <div className={selectedChat ? "msg-sidebar-hidden" : ""}>
        <MsgSidebar
          inbox={inbox}
          selectedChat={selectedChat}
          onlineUsers={onlineUsers}
          loadingInbox={loadingInbox}
          loadingSearch={loadingSearch}
          showSearch={showSearch}
          search={search}
          searchResults={searchResults}
          myId={myId}
          onNewChat={() => {
            setShowSearch((v) => !v);
            setSearch("");
            setSearchResults([]);
          }}
          onSearchChange={setSearch}
          onSearchClear={() => {
            setSearch("");
            setSearchResults([]);
          }}
          onOpenChat={openChat}
        />
      </div>

      {/* ── Chat window ── */}
      {selectedChat ? (
        <MsgChatWindow
          selectedChat={selectedChat}
          messages={messages}
          inputText={inputText}
          isTyping={isTyping}
          onlineUsers={onlineUsers}
          lastSeenMap={lastSeenMap}
          sending={sending}
          contextMenu={contextMenu}
          socket={socket}
          myId={myId}
          chatBodyRef={chatBodyRef}
          inputRef={inputRef}
          loadingChat={loadingChat}
          onBack={handleBack}
          onInputChange={handleInputChange}
          onSend={handleSend}
          onBubbleClick={setContextMenu}
          onDeleteMessage={handleDeleteMessage}
          onDeleteChatClick={() => setShowDeleteConfirm(true)}
        />
      ) : (
        <MsgEmptyState />
      )}

      {/* ── Delete conversation modal ── */}
      {showDeleteConfirm && (
        <MsgDeleteModal
          selectedChat={selectedChat}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteConversation}
        />
      )}
      <BottomNav />
    </div>
  );
}
