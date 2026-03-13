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
            <marker id="arrow-blue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#0f79bf" />
            </marker>
          </defs>
          <path d="M108 132 L108 221.5 Q108 221.5 118 221.5 L184 221.5" markerEnd="url(#arrow-blue)" />
          <path d="M344 221.5 L365 221.5" />
          <path d="M411 221.5 L458 221.5 L458 231 L509 231" markerEnd="url(#arrow-blue)" />
          <path d="M388 255 L388 300 L499 300" markerEnd="url(#arrow-blue)" />
          <path d="M388 255 L388 362 L512 362" markerEnd="url(#arrow-blue)" />
          <path d="M264 245 L264 330" markerEnd="url(#arrow-blue)" />
          <path d="M204 352.5 L72 352.5 L72 422 L192 422" markerEnd="url(#arrow-blue)" />
          <path d="M324 352.5 L420 352.5 L420 362 L512 362" markerEnd="url(#arrow-blue)" />
          <path d="M264 375 L264 450 L314 450 L314 475" markerEnd="url(#arrow-blue)" />
          <path d="M192 583 L125 583" markerEnd="url(#arrow-blue)" />
          <path d="M365 583 L382 583 L382 576 L398 576" markerEnd="url(#arrow-blue)" />
          <path d="M444 598 L444 610 L408.5 610 L408.5 620" markerEnd="url(#arrow-blue)" />
          <path d="M444 598 L444 610 L556 610 L556 620" markerEnd="url(#arrow-blue)" />
          <path d="M408.5 662 L408.5 730.5 L225 730.5" markerEnd="url(#arrow-blue)" />
          <path d="M381 662 L381 796.5 L178 796.5" markerEnd="url(#arrow-blue)" />
          <path d="M556 662 L556 797.5 L458 797.5" markerEnd="url(#arrow-blue)" />
        </svg>

        <div className="desk-clutter" aria-hidden="true">
          <span className="desk-doodle doodle-hook" />
          <span className="desk-doodle doodle-loop" />
          <span className="paper paper-yellow" />
          <span className="paper paper-blue" />
          <span className="paper paper-white" />
          <span className="paper paper-pink" />
          <span className="paper paper-grid" />
          <span className="desk-card desk-phone">
            <span className="phone-screen" />
            <span className="phone-button" />
          </span>
          <span className="desk-card desk-social">
            <span className="social-f">f</span>
          </span>
          <span className="desk-card desk-inbox">INBOX</span>
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
            </div>
          </div>
        </div>

        <h1 className="processing-title">
          <span>PROCESSiNG</span> your tasks
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
          <span className="node-icon icon-list" aria-hidden="true" />
          <span>Project Planning</span>
        </button>

        <button type="button" className="flow-node prompt process-node">
          Process it.
        </button>

        <button
          type="button"
          className={`flow-node section-node trash-node ${activeSection === 'trash' ? 'is-active' : ''}`}
          onClick={() => setActiveSection('trash')}
        >
          <span className="node-icon icon-trash" aria-hidden="true" />
          <span>Trash</span>
        </button>

        <button
          type="button"
          className={`flow-node section-node reference-node ${activeSection === 'reference' ? 'is-active' : ''}`}
          onClick={() => setActiveSection('reference')}
        >
          <span className="node-icon icon-clock icon-clock--outlined" aria-hidden="true" />
          <span>Reference</span>
        </button>

        <button
          type="button"
          className={`flow-node section-node someday-node ${activeSection === 'someday' ? 'is-active' : ''}`}
          onClick={() => setActiveSection('someday')}
        >
          <span className="node-icon icon-flag" aria-hidden="true" />
          <span>Someday</span>
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
          DO iT!
        </button>

        <button type="button" className="flow-node task-node" onClick={addItem}>
          <span className="task-plus">+</span>
          Task
        </button>

        <button
          type="button"
          className={`flow-node section-node defer-node ${activeSection === 'calendar' ? 'is-active' : ''}`}
          onClick={() => setActiveSection('calendar')}
        >
          <span className="node-icon icon-clock" aria-hidden="true" />
          <span>Defer it.</span>
        </button>

        <button
          type="button"
          className={`flow-node section-node delegate-node ${activeSection === 'waiting' ? 'is-active' : ''}`}
          onClick={() => setActiveSection('waiting')}
        >
          <span className="node-icon icon-people" aria-hidden="true" />
          <span>Delegate it.</span>
        </button>

        <button
          type="button"
          className={`flow-node section-node calendar-node ${activeSection === 'calendar' ? 'is-active' : ''}`}
          onClick={() => setActiveSection('calendar')}
        >
          <span className="node-icon icon-calendar" aria-hidden="true" />
          <span>Calendar</span>
        </button>

        <button
          type="button"
          className={`flow-node section-node hotlist-node ${activeSection === 'next' ? 'is-active' : ''}`}
          onClick={() => setActiveSection('next')}
        >
          <span className="node-icon icon-fire" aria-hidden="true" />
          <span>Hotlist</span>
        </button>

        <button
          type="button"
          className={`flow-node section-node waiting-node ${activeSection === 'waiting' ? 'is-active' : ''}`}
          onClick={() => setActiveSection('waiting')}
        >
          <span className="node-icon icon-clock icon-clock--outlined" aria-hidden="true" />
          <span>Waiting</span>
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
