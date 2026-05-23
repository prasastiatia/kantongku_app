import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { X, Upload, Loader2, Plus, Trash2, Users, Download } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatRupiah } from '../../utils/currencyUtils';
import { useCashflowStore } from '../../store/useCashflowStore';

interface SplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedItem {
  id: string;
  name: string;
  price: number;
  assignedTo: string[]; // array of person names
}

export const SplitBillModal: React.FC<SplitBillModalProps> = ({ isOpen, onClose }) => {
  const addTransaction = useCashflowStore((state) => state.addTransaction);
  
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [people, setPeople] = useState<string[]>(['Me', 'Friend A']);
  const [newPerson, setNewPerson] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      processOCR(url);
    }
  };

  const processOCR = async (imageUrl: string) => {
    setIsProcessing(true);
    setItems([]);
    try {
      const result = await Tesseract.recognize(imageUrl, 'eng', {
        logger: (m) => console.log(m)
      });
      
      const text = result.data.text;
      const lines = text.split('\n');
      const newItems: ParsedItem[] = [];
      
      // Naive parsing: Look for lines that end with numbers
      lines.forEach((line) => {
        const textStr = line.trim();
        // Regex to find trailing numbers like 15000, 15.000, 15,000
        const match = textStr.match(/(.+?)\s+((?:\d{1,3}[.,])*\d{3,}|\d+)$/);
        
        if (match) {
          const name = match[1].trim();
          // Clean up the number string to get raw integer
          const priceStr = match[2].replace(/[.,]/g, '');
          const price = parseInt(priceStr, 10);
          
          if (!isNaN(price) && price > 0 && name.length > 2) {
            newItems.push({
              id: crypto.randomUUID(),
              name,
              price,
              assignedTo: []
            });
          }
        }
      });
      
      if (newItems.length > 0) {
        setItems(newItems);
      } else {
        // Fallback if regex didn't catch anything, just to show UI
        setItems([{
          id: crypto.randomUUID(),
          name: 'Manual Item 1',
          price: 15000,
          assignedTo: []
        }]);
      }
    } catch (error) {
      console.error('OCR Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddPerson = () => {
    if (newPerson.trim() && !people.includes(newPerson.trim())) {
      setPeople([...people, newPerson.trim()]);
      setNewPerson('');
    }
  };

  const handleRemovePerson = (personToRemove: string) => {
    setPeople(people.filter(p => p !== personToRemove));
    // Remove person from all item assignments
    setItems(items.map(item => ({
      ...item,
      assignedTo: item.assignedTo.filter(p => p !== personToRemove)
    })));
  };

  const toggleAssignment = (itemId: string, person: string) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const isAssigned = item.assignedTo.includes(person);
        return {
          ...item,
          assignedTo: isAssigned 
            ? item.assignedTo.filter(p => p !== person)
            : [...item.assignedTo, person]
        };
      }
      return item;
    }));
  };

  // Calculate totals per person
  const totalsByPerson = people.reduce((acc, person) => {
    acc[person] = 0;
    return acc;
  }, {} as Record<string, number>);

  items.forEach(item => {
    if (item.assignedTo.length > 0) {
      const splitAmount = item.price / item.assignedTo.length;
      item.assignedTo.forEach(person => {
        if (totalsByPerson[person] !== undefined) {
          totalsByPerson[person] += splitAmount;
        }
      });
    }
  });

  const handleDownloadPDF = async () => {
    if (!summaryRef.current) return;
    setIsExporting(true);
    try {
      // Temporarily add a class or style to ensure it renders well in canvas
      const canvas = await html2canvas(summaryRef.current, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('split-bill-summary.pdf');
    } catch (error) {
      console.error('PDF Export Error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDone = () => {
    const myTotal = totalsByPerson['Me'] || 0;
    if (myTotal > 0) {
      addTransaction({
        title: 'Split Bill Share',
        amount: myTotal,
        date: new Date().toISOString(),
        category: 'Food & Dining',
        type: 'expense'
      });
    }
    
    // Reset state for next open
    setImage(null);
    setItems([]);
    setPeople(['Me', 'Friend A']);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Split Bill (OCR)</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid md:grid-cols-2 gap-8">
          
          {/* Left Column: Upload & OCR */}
          <div className="space-y-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 transition-colors group"
            >
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
              {image ? (
                <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden border border-slate-200">
                  <img src={image} alt="Receipt" className="object-cover w-full h-full" />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
                      <p className="text-sm font-medium text-slate-700">Scanning Receipt...</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                  <h4 className="font-semibold text-slate-700 mb-1">Upload Receipt</h4>
                  <p className="text-sm text-slate-500">Take a photo of your struk to auto-extract items</p>
                </>
              )}
            </div>

            {/* People Management */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
              <h4 className="font-semibold text-slate-700">Who's paying?</h4>
              <div className="flex flex-wrap gap-2">
                {people.map(person => (
                  <span key={person} className="inline-flex items-center bg-white border border-slate-200 rounded-full px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">
                    {person}
                    <button onClick={() => handleRemovePerson(person)} className="ml-2 text-slate-400 hover:text-rose-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  value={newPerson}
                  onChange={(e) => setNewPerson(e.target.value)}
                  placeholder="Add person..."
                  className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPerson()}
                />
                <button onClick={handleAddPerson} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Items & Assignment */}
          <div className="space-y-6 flex flex-col">
            <h3 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-2">Extracted Items</h3>
            
            {items.length === 0 && !isProcessing && (
              <div className="text-center p-8 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                <p className="text-slate-500 text-sm">Upload a receipt to see items here.</p>
              </div>
            )}

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 flex-1">
              {items.map((item, index) => (
                <div key={item.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <input 
                      type="text" 
                      value={item.name}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].name = e.target.value;
                        setItems(newItems);
                      }}
                      className="font-medium text-slate-800 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                    />
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-indigo-600">{formatRupiah(item.price)}</span>
                      <button 
                        onClick={() => setItems(items.filter(i => i.id !== item.id))}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Assignment Bubbles */}
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-50">
                    {people.map(person => {
                      const isAssigned = item.assignedTo.includes(person);
                      return (
                        <button
                          key={person}
                          onClick={() => toggleAssignment(item.id, person)}
                          className={cn(
                            "px-2.5 py-1 text-xs font-medium rounded-full transition-all border",
                            isAssigned 
                              ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                              : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                          )}
                        >
                          {person}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Summary - Capturable by html2canvas */}
            {items.length > 0 && (
              <div 
                ref={summaryRef} 
                className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 mt-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-indigo-900 text-sm uppercase tracking-wider">Split Summary</h4>
                  <button 
                    onClick={handleDownloadPDF}
                    disabled={isExporting}
                    className="flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-100 hover:bg-indigo-200 px-2.5 py-1.5 rounded-md transition-colors"
                  >
                    {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    <span>{isExporting ? 'Exporting...' : 'PDF'}</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  {Object.entries(totalsByPerson).map(([person, total]) => (
                    <div key={person} className="flex items-center justify-between border-b border-indigo-100/50 last:border-0 pb-2 last:pb-0">
                      <span className="text-indigo-800 font-medium">{person}</span>
                      <span className="font-bold text-indigo-600">{formatRupiah(total)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-indigo-200 flex justify-between items-center">
                  <span className="text-indigo-900 font-bold">Total Bill</span>
                  <span className="text-indigo-900 font-bold">
                    {formatRupiah(Object.values(totalsByPerson).reduce((a, b) => a + b, 0))}
                  </span>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
          <p className="text-sm text-slate-500 font-medium ml-2">
            Clicking "Done" will automatically add "Me"'s share to your expenses.
          </p>
          <button 
            onClick={handleDone}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            Done & Save
          </button>
        </div>
      </div>
    </div>
  );
};
