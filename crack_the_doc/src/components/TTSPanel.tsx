// src/components/TTSPanel.tsx
import { useState, useEffect } from 'react';
import { Play, Pause, StopCircle, Volume2 } from 'lucide-react';

type Props = {
  textToRead: string;
};

const TTSPanel = ({ textToRead }: Props) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const synth = window.speechSynthesis;

  useEffect(() => {
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    return () => {
      synth.cancel();
    };
  }, [textToRead, synth]);

  const handlePlayPause = () => {
    if (isPlaying && !isPaused) {
      synth.pause();
      setIsPaused(true);
    } else if (isPaused) {
      synth.resume();
      setIsPaused(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };
      synth.speak(utterance);
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    synth.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  return (
    <div className="flex items-center space-x-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <button 
        onClick={handlePlayPause}
        className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        aria-label={isPlaying && !isPaused ? 'Pause' : 'Play'}
      >
        {isPlaying && !isPaused ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </button>
      <button 
        onClick={handleStop}
        className="p-2 rounded-full bg-red-600 text-white hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        aria-label="Stop"
      >
        <StopCircle className="w-5 h-5" />
      </button>
      <div className="flex items-center space-x-2 flex-grow">
        <Volume2 className="w-5 h-5 text-gray-500" />
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: isPlaying ? '100%' : '0%', transition: isPlaying ? `width ${textToRead.length / 10}s linear` : '' }}></div>
        </div>
      </div>
    </div>
  );
};

export default TTSPanel;
