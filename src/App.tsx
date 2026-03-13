import { useState, useEffect } from 'react';
import './App.css';

export interface Item {
  id: string;
  text: string;
  status: 'inbox' | 'next' | 'project' | 'calendar' | 'waiting' | 'reference' | 'someday' | 'trash';
  dueDate?: Date;
  projectId?: string;
}

const sections = [
  { key: 'inbox', label: 'Inbox' },
  { key: 'next', label: 'Next Actions' },
  { key: 'projects', label: 'Projects' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'waiting', label: 'Waiting For' },
  { key: 'reference', label: 'Reference' },
  { key: 'someday', label: 'Someday/Maybe' },
  { key: 'trash', label: 'Trash' },
] as const;

function ProcessModal({ item, onClose, onMove }: { item: Item; onClose: () => void; onMove: (status: Item['status']) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: boolean }>({});

  const questions = [
    { question: "Is this item actionable?", options: ["Yes", "No"] },
    { question: "Does this require multiple steps?", options: ["Yes", "No"] },
    { question: "Is this delegated to someone else?", options: ["Yes", "No"] },
    { question: "Does this have a specific date/time?", options: ["Yes", "No"] },
  ];

  const handleAnswer = (answer: boolean) => {
    setAnswers({ ...answers, [step]: answer });
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Determine final status
      const { 0: actionable, 1: multiple, 2: delegated, 3: dated } = answers;
      let status: Item['status'] = 'inbox';
      if (!actionable) {
        status = 'reference'; // or someday/trash, but default to reference
      } else if (delegated) {
        status = 'waiting';
      } else if (dated) {
        status = 'calendar';
      } else if (multiple) {
        status = 'project';
      } else {
        status = 'next';
      }
      onMove(status);
      onClose();
    }
  };

  const currentQuestion = questions[step];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Process: {item.text}</h3>
        <p>{currentQuestion.question}</p>
        <div className="modal-buttons">
          {currentQuestion.options.map((option, index) => (
            <button key={option} onClick={() => handleAnswer(index === 0)}>
              {option}
            </button>
          ))}
        </div>
        <button className="close" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [activeSection, setActiveSection] = useState('inbox');
  const [processingItem, setProcessingItem] = useState<Item | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('gtd-items');
    if (stored) {
      const parsed = JSON.parse(stored);
      setItems(parsed.map((item: any) => ({
        ...item,
        dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
      })));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gtd-items', JSON.stringify(items));
  }, [items]);

  const addItem = () => {
    if (!newItemText.trim()) return;
    const newItem: Item = {
      id: Date.now().toString(),
      text: newItemText,
      status: 'inbox',
    };
    setItems([...items, newItem]);
    setNewItemText('');
  };

  const moveItem = (id: string, newStatus: Item['status']) => {
    setItems(items.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const filteredItems = items.filter(item => item.status === activeSection);

  return (
    <div className="app">
      <header>
        <h1>Getting Things Done</h1>
        <div className="capture">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Capture new item..."
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
          />
          <button className="add-btn" onClick={addItem}>Add</button>
        </div>
      </header>
      <nav>
        {sections.map(section => (
          <button
            key={section.key}
            className={activeSection === section.key ? 'active' : ''}
            onClick={() => setActiveSection(section.key)}
          >
            {section.label}
          </button>
        ))}
      </nav>
      <main>
        <ul>
          {filteredItems.map(item => (
            <li key={item.id}>
              <span>{item.text}</span>
              {activeSection === 'inbox' && (
                <div className="actions">
                  <button onClick={() => setProcessingItem(item)}>Process</button>
                </div>
              )}
              {activeSection !== 'inbox' && activeSection !== 'trash' && (
                <button onClick={() => moveItem(item.id, 'trash')}>Delete</button>
              )}
              {activeSection === 'trash' && (
                <button onClick={() => deleteItem(item.id)}>Permanently Delete</button>
              )}
            </li>
          ))}
        </ul>
      </main>
      {processingItem && (
        <ProcessModal
          item={processingItem}
          onClose={() => setProcessingItem(null)}
          onMove={(status) => {
            moveItem(processingItem.id, status);
            setActiveSection(status); // Switch to the new section after sorting
            setProcessingItem(null);
          }}
        />
      )}
    </div>
  );
}

export default App;