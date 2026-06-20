import { useState, useEffect, useRef, useCallback } from "react";
import { useSocket, getLoggedInId } from "../SocketContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/**
 * useMessagePage
 * Inbox fetch, conversation fetch, send, delete,
 * socket listeners, typing indicator — saari logic yahan.
 */
export default function useMessagePage() {
  const myId = getLoggedInId();
  const socket = useSocket();

  const [inbox, setInbox] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [lastSeenMap, setLastSeenMap] = useState({}); // userId → lastSeen ISO string
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [sending, setSending] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const chatBodyRef = useRef(null);
  const typingTimer = useRef(null);
  const selectedChatRef = useRef(null);
  const inputRef = useRef(null);

  // keep ref in sync
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // ── Auto-scroll ──────────────────────────────────────
  useEffect(() => {
    if (chatBodyRef.current)
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [messages, isTyping]);

  // ── Fetch inbox ──────────────────────────────────────
  const fetchInbox = useCallback(async () => {
    if (!myId) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}/api/message/inbox/${myId}`,{
        headers: {
        "Authorization": `Bearer ${token}`, // ← add karo
      },
      });
      if (!res.ok) throw new Error("inbox fetch failed");
      const data = await res.json();
      if (Array.isArray(data)) setInbox(data);
    } catch (e) {
      console.error("Inbox fetch error:", e);
    } finally {
      setLoadingInbox(false);
    }
  }, [myId]);

  useEffect(() => {
    fetchInbox();
  }, [fetchInbox]);

  // ── Socket listeners ─────────────────────────────────
  useEffect(() => {
    if (!socket || !myId) return;

    const onNewMessage = (msg) => {
      const chat = selectedChatRef.current;
      const otherId = msg.senderId === myId ? msg.receiverId : msg.senderId;
      if (chat && chat.user.userId === otherId) {
        setMessages((prev) => {
          const tmpIdx = prev.findIndex(
            (m) => m._temp && m.text === msg.text && m.senderId === myId,
          );
          if (tmpIdx !== -1) {
            const next = [...prev];
            next[tmpIdx] = msg;
            return next;
          }
          return [...prev, msg];
        });
      }
      fetchInbox();
    };

    const onTyping = ({ fromUserId }) => {
      if (selectedChatRef.current?.user.userId === fromUserId)
        setIsTyping(true);
    };
    const onStopTyping = ({ fromUserId }) => {
      if (selectedChatRef.current?.user.userId === fromUserId)
        setIsTyping(false);
    };
    const onOnline = (uid) => {
      setOnlineUsers((p) => new Set([...p, uid]));
      // Online hone pe lastSeen hatao (ab active hai)
      setLastSeenMap((p) => { const n = {...p}; delete n[uid]; return n; });
    };
    const onOffline = (uid) => {
      setOnlineUsers((p) => { const n = new Set(p); n.delete(uid); return n; });
      // Offline hone pe lastSeen = abhi ka time set karo (DB se real value baad mein aayegi)
      setLastSeenMap((p) => ({ ...p, [uid]: new Date().toISOString() }));
    };

    // Page load pe current online users fetch karo
    socket.emit("get_online_users");
    socket.on("online_users_list", (list) => {
      setOnlineUsers(new Set(list));
    });
    const onMsgDeleted = ({ messageId }) =>
      setMessages((prev) => prev.filter((m) => m._id !== messageId));

    // Dusre ne messages padhe → apne sent messages ki ticks blue karo
    const onMessagesRead = ({ readerId, senderId }) => {
      if (senderId === myId) {
        setMessages((prev) =>
          prev.map((m) => (m.senderId === myId && m.receiverId === readerId ? { ...m, read: true } : m))
        );
      }
    };

    socket.on("new_message", onNewMessage);
    socket.on("typing", onTyping);
    socket.on("stop_typing", onStopTyping);
    socket.on("user_online", onOnline);
    socket.on("user_offline", onOffline);
    socket.on("message_deleted", onMsgDeleted);
    socket.on("messages_read", onMessagesRead);

    return () => {
      socket.off("new_message", onNewMessage);
      socket.off("typing", onTyping);
      socket.off("stop_typing", onStopTyping);
      socket.off("user_online", onOnline);
      socket.off("user_offline", onOffline);
      socket.off("message_deleted", onMsgDeleted);
      socket.off("messages_read", onMessagesRead);
      socket.off("online_users_list");
    };
  }, [socket, myId, fetchInbox]);

  // ── Open conversation ────────────────────────────────
  const openChat = async (item) => {
    const token = localStorage.getItem("token");
    setSelectedChat(item);
    setShowSearch(false);
    setSearch("");
    setSearchResults([]);
    setMessages([]);
    setIsTyping(false);
    setLoadingChat(true);
    // lastSeen DB se aaya tha inbox mein — store karo
    if (item.user?.lastSeen) {
      setLastSeenMap((p) => ({ ...p, [item.user.userId]: item.user.lastSeen }));
    }
    try {
      const res = await fetch(
        `${BASE_URL}/api/message/conversation/${myId}/${item.user.userId}`,{
          headers:{"Authorization":`Bearer ${token}`}
        }
      );
      if (!res.ok) throw new Error("conversation fetch failed");
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
      setInbox((prev) =>
        prev.map((c) =>
          c.user.userId === item.user.userId ? { ...c, unread: 0 } : c,
        ),
      );
      // Socket se sender ko batao ke messages padh liye
      if (socket) {
        socket.emit("messages_read", { readerId: myId, senderId: item.user.userId });
      }
    } catch (e) {
      console.error("Conversation fetch error:", e);
    } finally {
      setLoadingChat(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // ── Send message ─────────────────────────────────────
  const handleSend = async () => {
    const token = localStorage.getItem("token");
    const text = inputText.trim();
    if (!text || !selectedChat || sending) return;
    setInputText("");
    setSending(true);

    const tempId = `tmp_${Date.now()}`;
    const temp = {
      _id: tempId,
      senderId: myId,
      receiverId: selectedChat.user.userId,
      text,
      createdAt: new Date().toISOString(),
      _temp: true,
    };
    setMessages((prev) => [...prev, temp]);

    try {
      const res = await fetch(`${BASE_URL}/api/message/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          senderId: myId,
          receiverId: selectedChat.user.userId,
          text,
        }),
      });
      if (!res.ok) throw new Error("send failed");
      const saved = await res.json();
      setMessages((prev) => prev.map((m) => (m._id === tempId ? saved : m)));
      fetchInbox();
    } catch (e) {
      console.error("Send error:", e);
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setInputText(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // ── Typing indicator ─────────────────────────────────
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (socket && selectedChat) {
      socket.emit("typing", { toUserId: selectedChat.user.userId });
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => {
        socket.emit("stop_typing", { toUserId: selectedChat.user.userId });
      }, 1500);
    }
  };

  // ── User search ──────────────────────────────────────
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      setLoadingSearch(false);
      return;
    }
    setLoadingSearch(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/message/search?q=${encodeURIComponent(search.trim())}&excludeId=${myId}`,
        );
        if (!res.ok) throw new Error("search failed");
        const data = await res.json();
        if (Array.isArray(data)) setSearchResults(data);
      } catch (e) {
        console.error("Search error:", e);
      } finally {
        setLoadingSearch(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [search, myId]);

  // ── Back (mobile) ────────────────────────────────────
  const handleBack = () => {
    if (socket && selectedChat)
      socket.emit("stop_typing", { toUserId: selectedChat.user.userId });
    setSelectedChat(null);
    setMessages([]);
    setIsTyping(false);
  };

  // ── Delete conversation ──────────────────────────────
  const handleDeleteConversation = async () => {
    const token = localStorage.getItem("token");
    if (!selectedChat) return;
    setShowDeleteConfirm(false);
    try {
      const res = await fetch(
        `${BASE_URL}/api/message/conversation/${myId}/${selectedChat.user.userId}`,
        { method: "DELETE",
          headers:{
            "Authorization":`Bearer ${token}`
          }
         },
      );
      if (!res.ok) throw new Error("delete failed");
      setInbox((prev) =>
        prev.filter((c) => c.user.userId !== selectedChat.user.userId),
      );
      setSelectedChat(null);
      setMessages([]);
    } catch (e) {
      console.error("Delete conversation error:", e);
    }
  };

  // ── Delete single message ─────────────────────────────
  const handleDeleteMessage = async (msgId, mine) => {
    const token = localStorage.getItem("token");
    setContextMenu(null);
    // Optimistically remove from UI
    setMessages((prev) => prev.filter((m) => m._id !== msgId));
    // Dono (sender aur receiver) API call karein — backend deletedFor handle karta hai
    try {
      const res = await fetch(`${BASE_URL}/api/message/${msgId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: myId }),
      });
      if (!res.ok) throw new Error("delete failed");
      fetchInbox();
    } catch (e) {
      console.error("Delete error:", e);
    }
  };

  return {
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
  };
}
