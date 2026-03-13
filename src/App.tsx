import { useEffect, useState } from 'react';
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

  return (
    <div className="app-shell">
      <section className="flowchart-card">
        <svg className="flow-lines" viewBox="0 0 676 843" aria-hidden="true">
          <defs>
            <marker id="arrow-blue" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#0f79bf" />
            </marker>
          </defs>
          <path d="M108 132 L108 210 Q108 220 118 220 L180 220" />
          <path d="M316 224 L372 224" />
          <path d="M465 224 L505 224" markerEnd="url(#arrow-blue)" />
          <path d="M430 228 L430 292 L485 292" markerEnd="url(#arrow-blue)" />
          <path d="M430 228 L430 357 L505 357" markerEnd="url(#arrow-blue)" />
          <path d="M273 248 L273 334" />
          <path d="M188 356 L79 356 L71 365 L71 410 L197 410" markerEnd="url(#arrow-blue)" />
          <path d="M327 357 L511 357" markerEnd="url(#arrow-blue)" />
          <path d="M274 400 L274 503" />
          <path d="M251 580 L125 580" markerEnd="url(#arrow-blue)" />
          <path d="M291 579 L402 579" />
          <path d="M443 602 L443 653" />
          <path d="M538 579 L538 749" markerEnd="url(#arrow-blue)" />
          <path d="M444 683 L444 725 Q444 730 439 730 L244 730" markerEnd="url(#arrow-blue)" />
          <path d="M332 731 L332 791 Q332 795 327 795 L163 795" markerEnd="url(#arrow-blue)" />
          <path d="M284 520 L284 568 Q284 579 273 579" />
          <path d="M205 412 L241 412 Q249 412 249 404 L249 368" />
        </svg>

        <div className="desk-clutter" aria-hidden="true">
          <span className="paper paper-yellow" />
          <span className="paper paper-blue" />
          <span className="paper paper-white" />
          <span className="paper paper-pink" />
          <span className="paper paper-grid" />
          <span className="clip clip-a" />
          <span className="clip clip-b" />
        </div>

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
              <button type="button" className="task-button" onClick={addItem}>
                <span className="task-plus">+</span>
                Task
              </button>
            </div>
          </div>
        </div>

        <h1 className="processing-title">
          <span>PROCESSING</span> your tasks
        </h1>

        <button type="button" className="flow-node prompt actionable">
          Is it actionable?
        </button>
        <span className="decision-badge badge-yes actionable-yes">Yes</span>
        <span className="decision-badge badge-no actionable-no">No</span>

        <button
          type="button"
          className={`flow-node section-node project-node ${activeSection === 'project' ? 'is-active' : ''}`}
          onClick={() => setActiveSection('project')}
        >
          Project Planning
        </button>

        <button type="button" className="flow-node prompt process-node">
          Process it.
        </button>

        <button
          type="button"
          className={`flow-node section-node trash-node ${activeSection === 'trash' ? 'is-active' : ''}`}
          onClick={() => setActiveSection('trash')}
        >
          Trash
        </button>

        <button
          type="button"
          className={`flow-node section-node reference-node ${activeSection === 'reference' ? 'is-active' : ''}`}
          onClick={() => setActiveSection('reference')}
        >
          Reference
        </button>

        <button
          type="button"
          className={`flow-node section-node someday-node ${activeSection === 'someday' ? 'is-active' : ''}`}
          onClick={() => setActiveSection('someday')}
        >
          Someday
        </button>

        <span className="note maybe-note">Eh, maybe later.</span>

        <button type="button" className="flow-node prompt minutes-node">
          Can you do it in 2 minutes?
        </button>
        <span className="decision-badge badge-yes quick-yes">Yes</span>
        <span className="decision-badge badge-no quick-no">No</span>

        <button
          type="button"
          className={`do-it-sticker ${activeSection === 'next' ? 'is-active' : ''}`}
          onClick={() => setActiveSection('next')}
        >
          DO IT!
        </button>

        <button
          type="button"
          className={`flow-node section-node defer-node ${activeSection === 'calendar' ? 'is-active' : ''}`}
          onClick={() => setActiveSection('calendar')}
        >
          Defer it.
        </button>

        <button
          type="button"
          className={`flow-node section-node delegate-node ${activeSection === 'waiting' ? 'is-active' : ''}`}
          onClick={() => setActiveSection('waiting')}
        >
          Delegate it.
        </button>

        <button
          type="button"
          className={`flow-node section-node calendar-node ${activeSection === 'calendar' ? 'is-active' : ''}`}
          onClick={() => setActiveSection('calendar')}
        >
          Calendar
        </button>

        <button
          type="button"
          className={`flow-node section-node hotlist-node ${activeSection === 'next' ? 'is-active' : ''}`}
          onClick={() => setActiveSection('next')}
        >
          Hotlist
        </button>

        <button
          type="button"
          className={`flow-node section-node waiting-node ${activeSection === 'waiting' ? 'is-active' : ''}`}
          onClick={() => setActiveSection('waiting')}
        >
          Waiting
        </button>

        <span className="note set-date-note">Set a date.</span>
        <span className="note do-next-note">Do it next.</span>
        <span className="note cant-do-note">Can&apos;t do it yet.</span>
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
