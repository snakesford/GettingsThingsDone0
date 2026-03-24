import { useEffect, useState, type CSSProperties } from 'react';
import './App.css';

export interface Item {
  id: string;
  text: string;
  status: 'inbox' | 'next' | 'project' | 'calendar' | 'waiting' | 'reference' | 'someday' | 'trash';
  dueDate?: Date;
  projectId?: string;
}

type SectionKey = Item['status'];

const sectionLabels: Record<SectionKey, string> = {
  inbox: 'Inbox',
  next: 'Hotlist',
  project: 'Project Planning',
  calendar: 'Calendar',
  waiting: 'Waiting',
  reference: 'Reference',
  someday: 'Someday',
  trash: 'Trash',
};

type HotspotConfig = {
  id: string;
  label: string;
  left: number;
  top: number;
  width: number;
  height: number;
  rotate?: number;
  section?: SectionKey;
  action?: 'addItem';
};

const hotspotConfigs: HotspotConfig[] = [
  { id: 'project', label: 'Project Planning', left: 9.8, top: 46.1, width: 19.4, height: 5.5, section: 'project' },
  { id: 'trash', label: 'Trash', left: 75.2, top: 24.2, width: 10.6, height: 5.6, section: 'trash' },
  { id: 'reference', label: 'Reference', left: 74.1, top: 32.4, width: 13.8, height: 5.5, section: 'reference' },
  { id: 'someday', label: 'Someday', left: 74.3, top: 39.4, width: 14.1, height: 5.5, section: 'someday' },
  { id: 'do-it', label: 'Hotlist', left: 3.6, top: 60.9, width: 12.9, height: 7.4, rotate: -13, section: 'next' },
  { id: 'task', label: 'Add task', left: 59.7, top: 61.3, width: 13.1, height: 5.9, action: 'addItem' },
  { id: 'defer', label: 'Calendar', left: 59.8, top: 70.8, width: 16.3, height: 5.3, section: 'calendar' },
  { id: 'delegate', label: 'Waiting', left: 77.2, top: 70.8, width: 18.8, height: 5.3, section: 'waiting' },
  { id: 'calendar', label: 'Calendar', left: 5.1, top: 83.2, width: 21.8, height: 5.4, section: 'calendar' },
  { id: 'hotlist', label: 'Hotlist', left: 5.1, top: 90.6, width: 15.4, height: 5.1, section: 'next' },
  { id: 'waiting', label: 'Waiting', left: 71.4, top: 87.1, width: 17.3, height: 5.3, section: 'waiting' },
];

function ProcessModal({
  item,
  onClose,
  onMove,
}: {
  item: Item;
  onClose: () => void;
  onMove: (status: Item['status']) => void;
}) {
  const [step, setStep] = useState(0);

  if (step === 0) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(event) => event.stopPropagation()}>
          <h3>Process: {item.text}</h3>
          <p>Is this item actionable?</p>
          <div className="modal-buttons">
            <button onClick={() => setStep(1)}>Yes</button>
            <button onClick={() => setStep(99)}>No</button>
          </div>
          <button className="close" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (step === 99) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(event) => event.stopPropagation()}>
          <h3>Process: {item.text}</h3>
          <p>Where should this go?</p>
          <div className="modal-buttons modal-buttons--stacked">
            <button onClick={() => onMove('trash')}>Trash</button>
            <button onClick={() => onMove('reference')}>Reference</button>
            <button onClick={() => onMove('someday')}>Someday</button>
          </div>
          <button className="close" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(event) => event.stopPropagation()}>
          <h3>Process: {item.text}</h3>
          <p>Can you do it in 2 minutes?</p>
          <div className="modal-buttons">
            <button onClick={() => onMove('next')}>Yes</button>
            <button onClick={() => setStep(2)}>No</button>
          </div>
          <button className="close" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(event) => event.stopPropagation()}>
          <h3>Process: {item.text}</h3>
          <p>Does this require multiple steps?</p>
          <div className="modal-buttons">
            <button onClick={() => onMove('project')}>Yes</button>
            <button onClick={() => setStep(3)}>No</button>
          </div>
          <button className="close" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <h3>Process: {item.text}</h3>
        <p>What should you do with it?</p>
        <div className="modal-buttons modal-buttons--stacked">
          <button onClick={() => onMove('calendar')}>Defer it</button>
          <button onClick={() => onMove('waiting')}>Delegate it</button>
        </div>
        <button className="close" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [activeSection, setActiveSection] = useState<SectionKey>('inbox');
  const [processingItem, setProcessingItem] = useState<Item | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('gtd-items');
    if (!stored) return;

    const parsed = JSON.parse(stored);
    setItems(
      parsed.map((item: Item & { dueDate?: string }) => ({
        ...item,
        dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
      }))
    );
  }, []);

  useEffect(() => {
    localStorage.setItem('gtd-items', JSON.stringify(items));
  }, [items]);

  const addItem = () => {
    if (!newItemText.trim()) return;

    setItems((current) => [
      ...current,
      {
        id: Date.now().toString(),
        text: newItemText.trim(),
        status: 'inbox',
      },
    ]);
    setNewItemText('');
    setActiveSection('inbox');
  };

  const moveItem = (id: string, status: Item['status']) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  const deleteItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const filteredItems = items.filter((item) => item.status === activeSection);

  const handleHotspotClick = (hotspot: HotspotConfig) => {
    if (hotspot.action === 'addItem') {
      addItem();
      return;
    }

    if (hotspot.section) {
      setActiveSection(hotspot.section);
    }
  };

  return (
    <div className="app-shell">
      <section
        className="flowchart-card"
        style={{ backgroundImage: 'url(/gtd-3.png)' }}
      >
        <div className="funnel-wrap">
          <button
            type="button"
            className={`inbox-trigger ${activeSection === 'inbox' ? 'is-active' : ''}`}
            onClick={() => setActiveSection('inbox')}
          >
            Inbox
          </button>
          <div className="funnel" aria-hidden="true" />
          <div className="capture-panel">
            <label className="capture-label" htmlFor="capture-input">
              Capture
            </label>
            <div className="capture-row">
              <input
                id="capture-input"
                type="text"
                value={newItemText}
                onChange={(event) => setNewItemText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') addItem();
                }}
                placeholder="Add to inbox..."
              />
            </div>
          </div>
        </div>

        <div className="hotspot-layer" aria-label="Flowchart controls">
          {hotspotConfigs.map((hotspot) => {
            const isActive = hotspot.section ? activeSection === hotspot.section : false;
            const style = {
              left: `${hotspot.left}%`,
              top: `${hotspot.top}%`,
              width: `${hotspot.width}%`,
              height: `${hotspot.height}%`,
              transform: hotspot.rotate ? `rotate(${hotspot.rotate}deg)` : undefined,
            } satisfies CSSProperties;

            return (
              <button
                key={hotspot.id}
                type="button"
                aria-label={hotspot.label}
                className={`overlay-button ${isActive ? 'is-active' : ''} ${hotspot.rotate ? 'is-rotated' : ''}`}
                style={style}
                onClick={() => handleHotspotClick(hotspot)}
              />
            );
          })}
        </div>
      </section>

      <section className="items-panel">
        <div className="items-panel__header">
          <div>
            <p className="eyebrow">Active section</p>
            <h2>{sectionLabels[activeSection]}</h2>
          </div>
          <p className="items-count">
            {filteredItems.length} item{filteredItems.length === 1 ? '' : 's'}
          </p>
        </div>

        <ul className="items-list">
          {filteredItems.length === 0 ? (
            <li className="empty-state">No items here yet.</li>
          ) : (
            filteredItems.map((item) => (
              <li key={item.id} className="item-card">
                <span>{item.text}</span>
                <div className="item-actions">
                  {activeSection === 'inbox' ? (
                    <button type="button" onClick={() => setProcessingItem(item)}>
                      Process
                    </button>
                  ) : activeSection === 'trash' ? (
                    <button type="button" className="danger" onClick={() => deleteItem(item.id)}>
                      Delete forever
                    </button>
                  ) : (
                    <button type="button" className="ghost" onClick={() => moveItem(item.id, 'trash')}>
                      Move to trash
                    </button>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      {processingItem && (
        <ProcessModal
          item={processingItem}
          onClose={() => setProcessingItem(null)}
          onMove={(status) => {
            moveItem(processingItem.id, status);
            setActiveSection(status);
            setProcessingItem(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
