// src/components/TTSPanel.tsx
import { useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

type Props = {
  textToRead: string;
};

const TTSPanel = ({ textToRead }: Props) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // In a real app, you would use the Web Speech API here.
  // const synth = window.speechSynthesis;
  // const utterance = new SpeechSynthesisUtterance(textToRead);

  const handlePlayPause = () => {
    // Mock functionality
    console.log(isPlaying ? "Pausing speech for:" : "Playing speech for:", textToRead);
    setIsPlaying(!isPlaying);
    // Real implementation:
    // if (isPlaying) {
    //   synth.pause();
    // } else {
    //   if (synth.paused) {
    //     synth.resume();
    //   } else {
    //     synth.speak(utterance);
    //   }
    // }
  };

  return (
    <div className="flex items-center space-x-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <button 
        onClick={handlePlayPause}
        className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </button>
      <div className="flex items-center space-x-2 flex-grow">
        <Volume2 className="w-5 h-5 text-gray-500" />
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: isPlaying ? '45%' : '0%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default TTSPanel;