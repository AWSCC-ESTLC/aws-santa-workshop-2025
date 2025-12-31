import { useEffect, useState } from 'react';
import { Mail, Sparkles, Send, Loader2 } from 'lucide-react';
import { api, Letter } from '@/services/api';
import { Button } from '@/components/ui/button';
import PageTransition from '@/components/PageTransition';
import { cn } from '@/lib/utils';

const Letters = () => {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [generatedReply, setGeneratedReply] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [newChildName, setNewChildName] = useState('');
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchLetters = async () => {
      setIsLoading(true);
      const data = await api.getLetters();
      setLetters(data);
      setIsLoading(false);
    };
    fetchLetters();
  }, []);

  const handleGenerateReply = async () => {
    if (!selectedLetter) return;
    
    setIsGenerating(true);
    setGeneratedReply('');
    
    const reply = await api.generateMagicReply(
      selectedLetter.childName, 
      selectedLetter.message
    );
    
    setGeneratedReply(reply);
    setIsGenerating(false);
  };

  const handleQuickReply = async () => {
    if (!newChildName || !newMessage) return;
    
    setIsGenerating(true);
    setGeneratedReply('');
    
    const reply = await api.generateMagicReply(newChildName, newMessage);
    
    setGeneratedReply(reply);
    setIsGenerating(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-6 w-40" />
        <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
          <div className="skeleton h-80 rounded-xl" />
          <div className="skeleton h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-foreground">Letters</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            {letters.length} letters received
          </p>
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Letters List */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-foreground">Inbox</h2>
            
            {letters.map((letter, index) => (
              <div 
                key={letter.id}
                onClick={() => {
                  setSelectedLetter(letter);
                  setGeneratedReply('');
                }}
                className={cn(
                  "rounded-lg bg-card border p-4 cursor-pointer transition-all animate-fade-in press-effect",
                  selectedLetter?.id === letter.id 
                    ? 'border-primary ring-1 ring-primary/20' 
                    : 'border-border hover:border-muted-foreground/30'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-sm">
                      ✉️
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-foreground">{letter.childName}</h3>
                      <p className="text-[10px] text-muted-foreground">{letter.receivedDate}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded",
                    letter.replied 
                      ? 'bg-nice/10 text-nice' 
                      : 'bg-accent/10 text-accent'
                  )}>
                    {letter.replied ? 'Replied' : 'Pending'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {letter.message}
                </p>
              </div>
            ))}
          </div>

          {/* Reply Generator */}
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-foreground">Reply Generator</h2>
            
            {/* Quick Reply Form */}
            <div className="rounded-xl bg-card border border-border p-4 animate-fade-in hover-lift">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Quick Reply</h3>
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                    placeholder="Child's name"
                    className="w-full rounded-lg bg-muted py-2 px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background transition-all duration-200"
                  />
                </div>
                <div>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Paste the letter here..."
                    rows={3}
                    className="w-full rounded-lg bg-muted py-2 px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background resize-none transition-all duration-200"
                  />
                </div>
                <Button 
                  size="sm"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground press-effect"
                  onClick={handleQuickReply}
                  disabled={isGenerating || !newChildName || !newMessage}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                      Generate Reply
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Selected Letter */}
            {selectedLetter && (
              <div className="rounded-xl bg-card border border-border p-4 animate-fade-in hover-lift">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-medium text-foreground">
                    Reply to {selectedLetter.childName}
                  </h3>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs press-effect"
                    onClick={handleGenerateReply}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 mr-1" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="p-3 rounded-lg bg-muted text-xs text-muted-foreground">
                  {selectedLetter.message}
                </div>
              </div>
            )}

            {/* Generated Reply */}
            {(isGenerating || generatedReply) && (
              <div className="rounded-xl bg-secondary p-4 text-secondary-foreground animate-fade-in">
                <div className="flex items-center gap-1.5 mb-3">
                  <Sparkles className="h-4 w-4" />
                  <h3 className="text-sm font-medium">Santa's Reply</h3>
                </div>
                
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="text-2xl mb-2 animate-bounce-in">✨</div>
                    <p className="text-xs opacity-80">Generating magic...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {generatedReply}
                    </p>
                    <div className="flex gap-2 pt-3 border-t border-secondary-foreground/20">
                      <Button 
                        size="sm"
                        className="flex-1 bg-secondary-foreground/20 hover:bg-secondary-foreground/30 text-secondary-foreground text-xs press-effect"
                      >
                        <Send className="h-3 w-3 mr-1.5" />
                        Send
                      </Button>
                      <Button 
                        size="sm"
                        variant="ghost" 
                        className="text-secondary-foreground hover:bg-secondary-foreground/10 text-xs press-effect"
                        onClick={() => setGeneratedReply('')}
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Letters;
