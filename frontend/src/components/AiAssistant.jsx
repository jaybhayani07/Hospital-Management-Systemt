import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, FileText, DollarSign } from 'lucide-react';

// Custom structured card for Lab Reports
const LabReportCard = ({ data }) => (
  <div className="bg-white border border-slate-200 rounded-lg p-4 mt-2 mb-2 shadow-sm">
    <div className="flex items-center gap-2 mb-3 border-b pb-2">
      <div className="bg-blue-100 p-2 rounded-full text-blue-600">
        <FileText size={18} />
      </div>
      <div>
        <h4 className="font-semibold text-slate-800 text-sm">Lab Report</h4>
        <p className="text-xs text-slate-500">Patient ID: {data.patientId}</p>
      </div>
    </div>
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-slate-500">Test Type:</span>
        <span className="font-medium">{data.testType}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-500">Status:</span>
        <span className={`font-medium ${data.status === 'Completed' ? 'text-green-600' : 'text-orange-500'}`}>
          {data.status}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-500">Date:</span>
        <span className="font-medium">{data.date}</span>
      </div>
    </div>
    <button className="w-full mt-4 bg-slate-50 text-blue-600 border border-blue-200 font-medium text-xs py-2 rounded-md hover:bg-blue-50 transition-colors">
      View Full Report
    </button>
  </div>
);

// Custom structured card for Invoices
const InvoiceCard = ({ data }) => (
  <div className="bg-white border border-slate-200 rounded-lg p-4 mt-2 mb-2 shadow-sm">
    <div className="flex items-center gap-2 mb-3 border-b pb-2">
      <div className="bg-purple-100 p-2 rounded-full text-purple-600">
        <DollarSign size={18} />
      </div>
      <div>
        <h4 className="font-semibold text-slate-800 text-sm">Invoice</h4>
        <p className="text-xs text-slate-500">Invoice #{data.invoiceId}</p>
      </div>
    </div>
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-slate-500">Patient:</span>
        <span className="font-medium">{data.patientName}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-500">Status:</span>
        <span className={`font-medium ${data.status === 'Paid' ? 'text-green-600' : 'text-red-500'}`}>
          {data.status}
        </span>
      </div>
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
        <span className="font-semibold text-slate-700">Total Amount:</span>
        <span className="font-bold text-lg text-slate-800">${data.amount}</span>
      </div>
    </div>
  </div>
);

const AiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', text: "Hello, Dr. Smith! I'm your AI assistant. I can fetch lab reports, check invoices, or summarize patient files for you." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { id: Date.now(), type: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // MOCK RESPONSE LOGIC
    setTimeout(() => {
      setIsTyping(false);
      let aiResponse = { id: Date.now(), type: 'ai', text: "I'm still learning how to process that request." };
      
      const lowerInput = userMessage.text.toLowerCase();
      
      if (lowerInput.includes('lab') || lowerInput.includes('report')) {
        aiResponse = {
          id: Date.now(),
          type: 'ai',
          text: "Here is the latest lab report you requested:",
          cardType: 'lab-report',
          cardData: { patientId: 'PT-8821', testType: 'Complete Blood Count', status: 'Completed', date: new Date().toLocaleDateString() }
        };
      } else if (lowerInput.includes('invoice') || lowerInput.includes('bill')) {
        aiResponse = {
          id: Date.now(),
          type: 'ai',
          text: "I found the invoice record:",
          cardType: 'invoice',
          cardData: { invoiceId: 'INV-4029', patientName: 'John Doe', status: 'Pending', amount: '1,250.00' }
        };
      }

      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            style={{ height: '500px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Medical AI Assistant</h3>
                  <p className="text-xs text-blue-100 opacity-90">Powered by Ollama</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Feed */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.type === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 shrink-0">
                      <Bot size={16} />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] ${msg.type === 'user' ? 'order-1' : 'order-2'}`}>
                    <div 
                      className={`p-3 rounded-2xl text-sm ${
                        msg.type === 'user' 
                          ? 'bg-blue-600 text-white rounded-tr-sm' 
                          : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                    
                    {/* Render Structured Cards if available */}
                    {msg.cardType === 'lab-report' && <LabReportCard data={msg.cardData} />}
                    {msg.cardType === 'invoice' && <InvoiceCard data={msg.cardData} />}
                  </div>

                  {msg.type === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center ml-2 shrink-0 order-2">
                      <User size={16} />
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1.5 items-center h-10 w-16">
                    <motion.div className="w-1.5 h-1.5 bg-slate-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                    <motion.div className="w-1.5 h-1.5 bg-slate-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                    <motion.div className="w-1.5 h-1.5 bg-slate-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-slate-200">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2 bg-slate-100 rounded-full p-1 pl-4"
              >
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..." 
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm text-slate-700"
                />
                <button 
                  type="submit"
                  disabled={!input.trim()}
                  className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Send size={16} className="ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow focus:outline-none"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </div>
  );
};

export default AiAssistant;
