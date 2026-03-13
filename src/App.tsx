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
  const [actionable, setActionable] = useState<null | boolean>(null);
  const [twoMin, setTwoMin] = useState<null | boolean>(null);
  const [isProject, setIsProject] = useState<null | boolean>(null);
  const [deferOrDelegate, setDeferOrDelegate] = useState<null | 'defer' | 'delegate'>(null);
  const [nonActionableDest, setNonActionableDest] = useState<null | 'trash' | 'reference' | 'someday'>(null);

  // Step 0: Is it actionable?
  if (step === 0) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <h3>Process: {item.text}</h3>
          <p>Is this item actionable?</p>
          <div className="modal-buttons">
            <button onClick={() => { setActionable(true); setStep(1); }}>Yes</button>
            <button onClick={() => { setActionable(false); setStep(99); }}>No</button>
          </div>
          <button className="close" onClick={onClose}>Cancel</button>
        </div>
      </div>
    );
  }

  // Step 99: Not actionable - choose destination
  if (step === 99) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <h3>Process: {item.text}</h3>
          <p>Where should this go?</p>
          <div className="modal-buttons">
            <button onClick={() => { setNonActionableDest('trash'); onMove('trash'); }}>Trash</button>
            <button onClick={() => { setNonActionableDest('reference'); onMove('reference'); }}>Reference</button>
            <button onClick={() => { setNonActionableDest('someday'); onMove('someday'); }}>Someday</button>
          </div>
          <button className="close" onClick={onClose}>Cancel</button>
        </div>
      </div>
    );
  }

  // Step 1: Can you do it in 2 minutes?
  if (step === 1) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <h3>Process: {item.text}</h3>
          <p>Can you do it in 2 minutes?</p>
          <div className="modal-buttons">
            <button onClick={() => { setTwoMin(true); onMove('next'); }}>Yes (Do it!)</button>
            <button onClick={() => { setTwoMin(false); setStep(2); }}>No</button>
          </div>
          <button className="close" onClick={onClose}>Cancel</button>
        </div>
      </div>
    );
  }

  // Step 2: Is it a project (requires multiple steps)?
  if (step === 2) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <h3>Process: {item.text}</h3>
          <p>Does this require multiple steps (project)?</p>
          <div className="modal-buttons">
            <button onClick={() => { setIsProject(true); onMove('projects'); }}>Yes (Project)</button>
            <button onClick={() => { setIsProject(false); setStep(3); }}>No</button>
          </div>
          <button className="close" onClick={onClose}>Cancel</button>
        </div>
      </div>
    );
  }

  // Step 3: Defer or Delegate
  if (step === 3) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <h3>Process: {item.text}</h3>
          <p>What should you do with it?</p>
          <div className="modal-buttons">
            <button onClick={() => { setDeferOrDelegate('defer'); onMove('calendar'); }}>Defer (Set a date)</button>
            <button onClick={() => { setDeferOrDelegate('delegate'); onMove('waiting'); }}>Delegate (Waiting)</button>
          </div>
          <button className="close" onClick={onClose}>Cancel</button>
        </div>
      </div>
    );
  }

  return null;
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