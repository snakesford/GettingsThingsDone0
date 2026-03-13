import { useState, useEffect } from 'react';
import './App.css';
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

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [activeSection, setActiveSection] = useState('inbox');

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
          <button onClick={addItem}>Add</button>
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
                  <button onClick={() => moveItem(item.id, 'next')}>Next Action</button>
                  <button onClick={() => moveItem(item.id, 'project')}>Project</button>
                  <button onClick={() => moveItem(item.id, 'calendar')}>Calendar</button>
                  <button onClick={() => moveItem(item.id, 'waiting')}>Waiting</button>
                  <button onClick={() => moveItem(item.id, 'reference')}>Reference</button>
                  <button onClick={() => moveItem(item.id, 'someday')}>Someday</button>
                  <button onClick={() => moveItem(item.id, 'trash')}>Trash</button>
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
    </div>
  );
}

export default App;