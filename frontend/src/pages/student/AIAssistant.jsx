import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Lightbulb, X } from 'lucide-react';
import { aiService } from '../../services';
import { Card, PageHeader, Button } from '../../components/ui';
import toast from 'react-hot-toast';

export default function StudentAIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your CampusConnect AI assistant. How can I help you today? I can help you with:\n\n• Finding classrooms and facilities\n• Attendance policies and calculations\n• Upcoming events information\n• Complaint status checks\n• Campus rules and regulations\n• Navigating the campus management system',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestions = [
    'What is my attendance percentage?',
    'How do I register for an event?',
    'How to raise a complaint?',
    'What are the campus rules?',
  ];

  const handleSend = async (message) => {
    if (!message.trim()) return;

    const userMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiService.chat(message);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      toast.error(err.response?.data?.response || 'Failed to get response');
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
  };

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-8rem)]">
      <div className="page-header">
        <h1 className="page-title">AI Assistant</h1>
        <p className="page-subtitle">Get instant help with your campus queries</p>
      </div>

      <Card className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {msg.role === 'user' ? '👤' : <Bot className="w-5 h-5" />}
                </div>
                <div className={`p-4 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-50 text-slate-800'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 text-slate-600">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-50">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {messages.length === 1 && (
          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Type your question..."
            className="input flex-1"
            disabled={loading}
          />
          <Button
            onClick={() => handleSend(input)}
            loading={loading}
            disabled={!input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}