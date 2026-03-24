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
  className?: string;
  section?: SectionKey;
  action?: 'addItem';
};

const hotspotConfigs: HotspotConfig[] = [
  { id: 'project', label: 'Project Planning', left: 2.7, top: 47.4, width: 24.4, height: 5.5, className: 'overlay-button--soft', section: 'project' },
  { id: 'trash', label: 'Trash', left: 71.6, top: 24.0, width: 15.2, height: 5.4, className: 'overlay-button--soft', section: 'trash' },
  { id: 'reference', label: 'Reference', left: 75.1, top: 32.1, width: 16.7, height: 4.9, className: 'overlay-button--soft', section: 'reference' },
  { id: 'someday', label: 'Someday', left: 76.0, top: 39.2, width: 15.7, height: 4.9, className: 'overlay-button--soft', section: 'someday' },
  { id: 'calendar', label: 'Calendar', left: 8.1, top: 84.8, width: 19.9, height: 4.7, className: 'overlay-button--soft', section: 'calendar' },
  { id: 'hotlist', label: 'Hotlist', left: 8.2, top: 91.8, width: 18.0, height: 4.7, className: 'overlay-button--soft', section: 'next' },
  { id: 'waiting', label: 'Waiting', left: 66.2, top: 91.7, width: 16.7, height: 4.8, className: 'overlay-button--soft', section: 'waiting' },
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
            <button className="modal-yes" onClick={() => setStep(1)}>Yes</button>
            <button className="modal-no" onClick={() => setStep(99)}>No</button>
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
            <button className="modal-option" onClick={() => onMove('trash')}>
              <span className="node-icon icon-trash" aria-hidden="true" />
              Trash
            </button>
            <button className="modal-option" onClick={() => onMove('reference')}>
              <span className="node-icon icon-clock--outlined" aria-hidden="true" />
              Reference
            </button>
            <button className="modal-option" onClick={() => onMove('someday')}>
              <span className="node-icon icon-flag" aria-hidden="true" />
              Someday
            </button>
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
            <button className="modal-yes" onClick={() => onMove('next')}>Yes</button>
            <button className="modal-no" onClick={() => setStep(2)}>No</button>
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
            <button className="modal-yes" onClick={() => onMove('project')}>Yes</button>
            <button className="modal-no" onClick={() => setStep(3)}>No</button>
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

  const completeItem = (id: string) => {
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
                className={`overlay-button ${hotspot.className ?? ''} ${isActive ? 'is-active' : ''} ${hotspot.rotate ? 'is-rotated' : ''}`}
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
                  {activeSection === 'inbox' && (
                    <button type="button" onClick={() => setProcessingItem(item)}>
                      Process
                    </button>
                  )}
                  <button
                    type="button"
                    className="danger"
                    onClick={() => (activeSection === 'trash' ? deleteItem(item.id) : moveItem(item.id, 'trash'))}
                  >
                    Delete
                  </button>
                  <button type="button" className="complete" onClick={() => completeItem(item.id)}>
                    Complete
                  </button>
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
