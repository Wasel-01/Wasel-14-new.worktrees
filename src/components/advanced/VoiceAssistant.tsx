/**
 * Voice Assistant - UNIQUE FEATURE
 * 
 * Voice-activated booking and navigation with multilingual support
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../ui/button';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'sonner';

interface VoiceCommand {
  command: string;
  action: () => void;
  patterns: RegExp[];
}

export function VoiceAssistant() {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if Speech Recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language === 'ar' ? 'ar-AE' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);

        if (event.results[current].isFinal) {
          processCommand(transcriptText);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'no-speech') {
          speak(language === 'ar' ? 'لم أسمع شيئاً، حاول مرة أخرى' : "I didn't hear anything, please try again");
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [language]);

  const commands: VoiceCommand[] = [
    {
      command: 'book_ride',
      action: () => {
        speak(language === 'ar' ? 'حسناً، دعني أساعدك في حجز رحلة' : 'Sure, let me help you book a ride');
        // Navigate to booking page
      },
      patterns: [
        /book.*ride/i,
        /need.*ride/i,
        /take.*me/i,
        /احجز.*رحلة/i,
        /أريد.*رحلة/i,
      ],
    },
    {
      command: 'check_status',
      action: () => {
        speak(language === 'ar' ? 'دعني أتحقق من حالة رحلتك' : 'Let me check your trip status');
      },
      patterns: [
        /where.*driver/i,
        /trip.*status/i,
        /check.*status/i,
        /أين.*السائق/i,
        /حالة.*الرحلة/i,
      ],
    },
    {
      command: 'emergency',
      action: () => {
        speak(language === 'ar' ? 'تفعيل الطوارئ، الاتصال بالدعم' : 'Activating emergency, contacting support');
        // Trigger SOS
      },
      patterns: [
        /help/i,
        /emergency/i,
        /sos/i,
        /مساعدة/i,
        /طوارئ/i,
      ],
    },
    {
      command: 'cancel_trip',
      action: () => {
        speak(language === 'ar' ? 'هل أنت متأكد من إلغاء الرحلة؟' : 'Are you sure you want to cancel the trip?');
      },
      patterns: [
        /cancel/i,
        /stop/i,
        /إلغاء/i,
        /توقف/i,
      ],
    },
  ];

  const startListening = () => {
    if (!isSupported) {
      toast.error('Voice recognition is not supported in your browser');
      return;
    }

    setIsListening(true);
    setTranscript('');
    recognitionRef.current?.start();
    
    speak(language === 'ar' ? 'نعم، أنا أستمع' : 'Yes, I\'m listening');
  };

  const stopListening = () => {
    setIsListening(false);
    recognitionRef.current?.stop();
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'ar' ? 'ar-AE' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const processCommand = (text: string) => {
    const command = commands.find(cmd =>
      cmd.patterns.some(pattern => pattern.test(text))
    );

    if (command) {
      command.action();
    } else {
      speak(
        language === 'ar'
          ? 'عذراً، لم أفهم الأمر. حاول قول "احجز رحلة" أو "أين السائق"'
          : 'Sorry, I didn\'t understand. Try saying "book a ride" or "where is my driver"'
      );
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <>
      {/* Voice Assistant Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-24 left-6 z-40"
      >
        <Button
          onClick={isListening ? stopListening : startListening}
          size="lg"
          className={`
            w-16 h-16 rounded-full shadow-2xl
            ${isListening
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
            }
          `}
        >
          <motion.div
            animate={isListening ? {
              scale: [1, 1.2, 1],
            } : {}}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          >
            {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
          </motion.div>
        </Button>

        {/* Pulse effect */}
        {isListening && (
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
            className="absolute inset-0 bg-red-600 rounded-full -z-10"
          />
        )}
      </motion.div>

      {/* Transcript Panel */}
      <AnimatePresence>
        {(isListening || transcript) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-44 left-6 z-40 max-w-xs"
          >
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {isSpeaking ? <Volume2 className="w-5 h-5 text-indigo-600" /> : <Mic className="w-5 h-5 text-indigo-600" />}
                </motion.div>
                <span className="text-sm font-semibold">
                  {isListening ? (language === 'ar' ? 'أستمع...' : 'Listening...') : (language === 'ar' ? 'أتحدث...' : 'Speaking...')}
                </span>
              </div>
              
              {transcript && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  "{transcript}"
                </p>
              )}

              {!transcript && isListening && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {language === 'ar'
                    ? 'قل شيئاً مثل "احجز رحلة" أو "أين السائق"'
                    : 'Say something like "book a ride" or "where is my driver"'
                  }
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
