"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Send,
  MessageSquare,
  Plus,
  Loader2,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  createChat,
  sendMessage,
  subscribeToChats,
  subscribeToMessages,
  ChatSession,
  Message,
} from "@/lib/firebase/chat";
import { getChatResponse } from "@/lib/gemini";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";

const suggestions = [
  "Bagaimana cara meningkatkan penjualan online?",
  "Strategi marketing untuk produk baru?",
  "Cara mengelola stok yang efisien?",
  "Tips pelayanan pelanggan yang baik?",
];

export default function ChatPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingResponse, setLoadingResponse] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [mounted, setMounted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to chat list
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToChats(user.uid, (data) => {
      setChats(data);
    });
    return () => unsubscribe();
  }, [user]);

  // For portal mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Subscribe to messages when active chat changes
  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }
    const unsubscribe = subscribeToMessages(activeChatId, (data) => {
      setMessages(data);
    });
    return () => unsubscribe();
  }, [activeChatId]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingResponse]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || !user || loadingResponse) return;

    setInput(""); // Clear input immediately
    setLoadingResponse(true);

    try {
      let chatId = activeChatId;

      // Create new chat if none active
      if (!chatId) {
        const title =
          textToSend.length > 30
            ? textToSend.substring(0, 30) + "..."
            : textToSend;
        chatId = await createChat(user.uid, title);
        setActiveChatId(chatId);
      }

      // 1. Send User Message to Firestore
      await sendMessage(chatId!, "user", textToSend);

      // 2. Get Gemini Response
      // Need to format current messages for history + the new message
      const historyForApi = messages.map((m) => ({
        role: m.role,
        parts: m.content,
      }));

      const reply = await getChatResponse(historyForApi, textToSend);

      // 3. Send AI Response to Firestore
      await sendMessage(chatId!, "model", reply);
    } catch (error) {
      console.error("Chat failed:", error);
    } finally {
      setLoadingResponse(false);
    }
  };

  const startNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setInput("");
  };

  return (
    <div className="flex h-[calc(100vh-64px)] md:h-screen bg-white overflow-hidden">
      {/* Sidebar History */}
      <div className="hidden md:flex flex-col w-80 border-r border-gray-100 bg-[#f8f9fa] h-full">
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full flex items-center justify-center gap-2 bg-[#FF9600] text-white py-3 rounded-xl font-medium hover:bg-[#e68a00] transition-colors shadow-sm"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          <div className="flex justify-between items-center mb-3 px-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Histori
            </h3>
            <button
              onClick={startNewChat}
              className="text-xs text-[#FF9600] hover:underline font-medium flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Baru
            </button>
          </div>

          <div className="space-y-1">
            {chats.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4 italic">
                Belum ada percakapan
              </p>
            ) : (
              chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center gap-3 group text-sm",
                    activeChatId === chat.id
                      ? "bg-white shadow-sm border border-gray-100 text-[#FF9600] font-medium"
                      : "text-gray-600 hover:bg-gray-100",
                  )}
                >
                  <MessageSquare
                    className={cn(
                      "w-4 h-4",
                      activeChatId === chat.id
                        ? "text-[#FF9600]"
                        : "text-gray-400 group-hover:text-[#FF9600]",
                    )}
                  />
                  <span className="truncate flex-1">{chat.title}</span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-gray-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-yellow-400 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white shadow-sm">
              Pro
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800">Upgrade to Plus</p>
              <p className="text-xs text-gray-500">Get better insights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Hamburger Menu & Sidebar */}
      <button
        onClick={() => setShowMobileSidebar(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2.5 bg-[#FF9600] text-white rounded-xl shadow-lg hover:bg-[#e68a00] transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Sidebar via Portal */}
      {mounted &&
        createPortal(
          <>
            {showMobileSidebar && (
              <>
                {/* Backdrop */}
                <div
                  onClick={() => setShowMobileSidebar(false)}
                  className="md:hidden fixed inset-0 bg-black/30 z-[100] backdrop-blur-sm"
                />
                {/* Drawer */}
                <div className="md:hidden fixed top-0 left-0 h-screen w-80 bg-[#f8f9fa] z-[110] shadow-2xl flex flex-col transform transition-transform duration-300">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">
                      Histori Chat
                    </h2>
                    <button
                      onClick={() => setShowMobileSidebar(false)}
                      className="p-2 text-gray-500 hover:text-gray-900 bg-gray-100 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-4 border-b border-gray-100">
                    <button
                      onClick={() => {
                        router.push("/dashboard");
                        setShowMobileSidebar(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-[#FF9600] text-white py-3 rounded-xl font-medium hover:bg-[#e68a00] transition-colors shadow-sm"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Dashboard
                    </button>
                  </div>

                  <div className="p-4 overflow-y-auto flex-1">
                    <div className="flex justify-between items-center mb-3 px-2">
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Histori
                      </h3>
                      <button
                        onClick={() => {
                          startNewChat();
                          setShowMobileSidebar(false);
                        }}
                        className="text-xs text-[#FF9600] hover:underline font-medium flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Baru
                      </button>
                    </div>

                    <div className="space-y-1">
                      {chats.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4 italic">
                          Belum ada percakapan
                        </p>
                      ) : (
                        chats.map((chat) => (
                          <button
                            key={chat.id}
                            onClick={() => {
                              setActiveChatId(chat.id);
                              setShowMobileSidebar(false);
                            }}
                            className={cn(
                              "w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center gap-3 group text-sm",
                              activeChatId === chat.id
                                ? "bg-white shadow-sm border border-gray-100 text-[#FF9600] font-medium"
                                : "text-gray-600 hover:bg-gray-100",
                            )}
                          >
                            <MessageSquare
                              className={cn(
                                "w-4 h-4",
                                activeChatId === chat.id
                                  ? "text-[#FF9600]"
                                  : "text-gray-400 group-hover:text-[#FF9600]",
                              )}
                            />
                            <span className="truncate flex-1">
                              {chat.title}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-gray-200">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-yellow-400 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white shadow-sm">
                        Pro
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-800">
                          Upgrade to Plus
                        </p>
                        <p className="text-xs text-gray-500">
                          Get better insights
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>,
          document.body,
        )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {activeChatId && (messages.length > 0 || loadingResponse) ? (
          // --- ACTIVE CHAT VIEW ---
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex w-full mb-4",
                  msg.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] md:max-w-[70%] p-4 rounded-2xl text-sm md:text-base leading-relaxed",
                    msg.role === "user"
                      ? "bg-[#FF9600] text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none",
                  )}
                >
                  {msg.role === "model" ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {loadingResponse && (
              <div className="flex w-full justify-start animate-pulse">
                <div className="bg-gray-100 p-4 rounded-2xl rounded-bl-none flex items-center gap-2 text-gray-500 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Arsa sedang mengetik...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          // --- EMPTY STATE / WELCOME VIEW ---
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
            <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="w-32 h-32 md:w-40 md:h-40 mx-auto relative mb-6">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                >
                  <source src="/animations/mascot-arsa.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <h1 className="text-3xl text-gray-900 md:text-4xl font-bold mb-2 tracking-tight">
                Halo,{" "}
                {user?.displayName ? user.displayName.split(" ")[0] : "Partner"}
                !
              </h1>
              <p className="text-[#FF9600] text-2xl md:text-xl font-bold">
                Ayo ceritakan keluhan bisnis Anda hari ini.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(suggestion)}
                  className="p-4 text-left bg-white border border-gray-100 rounded-2xl hover:border-[#FF9600] hover:shadow-md transition-all text-gray-600 text-sm md:text-base group"
                >
                  <span className="group-hover:text-[#FF9600] transition-colors">
                    {suggestion}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-white border-t border-gray-100 w-full shrink-0 z-20">
          <div className="max-w-4xl mx-auto relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ceritakan keluhan atau tanyakan apa saja..."
              className="w-full pl-5 pr-14 py-4 rounded-2xl border border-gray-200 focus:border-[#FF9600] focus:ring-2 focus:ring-[#FF9600]/20 outline-none transition-all resize-none shadow-sm min-h-[60px] max-h-[150px] text-gray-700"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loadingResponse}
              className="absolute right-3 bottom-3 p-2.5 bg-[#FF9600] text-white rounded-xl hover:bg-[#e68a00] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {loadingResponse ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-3">
            Arsa dapat memberikan saran, namun selalu verifikasi informasi
            penting.
          </p>
        </div>
      </div>
    </div>
  );
}
