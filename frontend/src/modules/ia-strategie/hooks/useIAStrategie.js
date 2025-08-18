import { useState } from 'react';
import { generateContextualContent } from '../utils/contentGenerator';

/**
 * Hook pour la gestion de l'état du module IA Stratégie
 */
export const useIAStrategie = () => {
  const [selectedModel, setSelectedModel] = useState('gemini');
  const [inputText, setInputText] = useState('');
  const [showCanvas, setShowCanvas] = useState(false);
  const [canvasContent, setCanvasContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const aiModels = [
    { id: 'gemini', name: 'Gemini Pro', icon: '🟢', provider: 'Google' },
    { id: 'chatgpt', name: 'GPT-4', icon: '🟡', provider: 'OpenAI' },
    { id: 'claude', name: 'Claude 3.5', icon: '🔵', provider: 'Anthropic' },
    { id: 'mistral', name: 'Mistral Large', icon: '🟠', provider: 'Mistral AI' }
  ];

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    setShowCanvas(true);
    
    // Simulation de génération avec données contextuelles
    setTimeout(() => {
      const generatedContent = generateContextualContent(inputText, selectedModel);
      setCanvasContent(generatedContent);
      setIsGenerating(false);
    }, 2000 + Math.random() * 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return {
    selectedModel,
    setSelectedModel,
    inputText,
    setInputText,
    showCanvas,
    setShowCanvas,
    canvasContent,
    setCanvasContent,
    isGenerating,
    aiModels,
    handleGenerate,
    handleKeyPress
  };
};

export default useIAStrategie;