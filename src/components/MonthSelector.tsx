import React, { useState } from 'react';
import { formatMonthLabel } from '../utils';
import { useAuth } from './AuthContext';

interface MonthSelectorProps {
  activeMonthId: string;
  monthIds: string[];
  initializedMonthIds: string[];
  onSelect: (monthId: string) => void;
  onCreate: (monthId: string) => Promise<void>;
  onDelete: (monthId: string) => Promise<void>;
  canDelete: boolean;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
  activeMonthId,
  monthIds,
  initializedMonthIds,
  onSelect,
  onCreate,
  onDelete,
  canDelete
}) => {
  const { isLocked } = useAuth();
  const [newMonthId, setNewMonthId] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');

  const handleCreate = async () => {
    if (!newMonthId || isLocked || initializedMonthIds.includes(newMonthId)) return;
    setStatus('loading');
    try {
      await onCreate(newMonthId);
      setStatus('success');
      setNewMonthId('');
      window.setTimeout(() => {
        setIsCreateOpen(false);
        setStatus('idle');
      }, 500);
    } catch {
      setStatus('error');
    } finally {
      // The visible state above communicates completion or failure.
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmation !== activeMonthId || !canDelete || isLocked) return;
    setDeleteStatus('loading');
    try {
      await onDelete(activeMonthId);
      setDeleteConfirmation('');
      setIsDeleteOpen(false);
      setDeleteStatus('idle');
    } catch {
      setDeleteStatus('error');
    }
  };

  return (
    <section className="month-selector" aria-label="Billing month" data-state={status}>
      <div className="month-selector-bar">
        <div className="month-selector-current">
          <span className="month-selector-icon" aria-hidden="true">
            <i className="far fa-calendar"></i>
          </span>
          <div className="month-selector-copy">
            <span className="month-selector-label">Viewing period</span>
            <div className="month-select-wrap">
              <select value={activeMonthId} onChange={(e) => onSelect(e.target.value)} aria-label="Select billing month">
                {monthIds.map(monthId => (
                  <option key={monthId} value={monthId}>{formatMonthLabel(monthId)}</option>
                ))}
              </select>
              <i className="fas fa-chevron-down" aria-hidden="true"></i>
            </div>
          </div>
        </div>
        <div className="month-selector-actions">
          <button
            className="month-delete-trigger"
            onClick={() => {
              setIsDeleteOpen(open => !open);
              setIsCreateOpen(false);
              setDeleteConfirmation('');
              setDeleteStatus('idle');
            }}
            disabled={isLocked || !canDelete}
            aria-expanded={isDeleteOpen}
            aria-label={`Delete ${formatMonthLabel(activeMonthId)}`}
            title={isLocked ? 'Unlock Settings to delete a month' : !canDelete ? 'This month has no saved data' : 'Delete this month'}
          >
            <i className={isDeleteOpen ? 'fas fa-times' : 'far fa-trash-alt'} aria-hidden="true"></i>
          </button>
          <button
            className="month-create-trigger"
            onClick={() => {
              setIsCreateOpen(open => !open);
              setIsDeleteOpen(false);
              setStatus('idle');
            }}
            disabled={isLocked}
            aria-expanded={isCreateOpen}
            title={isLocked ? 'Unlock Settings to create a month' : undefined}
          >
            <i className={isCreateOpen ? 'fas fa-times' : 'fas fa-plus'} aria-hidden="true"></i>
            <span>{isCreateOpen ? 'Cancel' : 'New month'}</span>
          </button>
        </div>
      </div>

      {isCreateOpen && (
        <div className="month-create-panel">
          <div className="month-create-copy">
            <strong>Create another month</strong>
            <span>Fee settings will be copied from {formatMonthLabel(activeMonthId)}.</span>
          </div>
          <div className="month-create-controls">
            <input
              type="month"
              value={newMonthId}
              onChange={(e) => { setNewMonthId(e.target.value); setStatus('idle'); }}
              disabled={status === 'loading'}
              aria-label="New billing month"
              aria-invalid={status === 'error'}
              autoFocus
            />
            <button
              className="month-create-confirm"
              onClick={handleCreate}
              disabled={!newMonthId || status === 'loading' || initializedMonthIds.includes(newMonthId)}
            >
              <i className={status === 'success' ? 'fas fa-check' : status === 'loading' ? 'fas fa-circle-notch fa-spin' : 'fas fa-arrow-right'} aria-hidden="true"></i>
              {status === 'success' ? 'Created' : status === 'loading' ? 'Creating' : 'Create'}
            </button>
          </div>
          <div className="month-create-status" aria-live="polite">
            {status === 'error'
              ? 'Could not save this month to Firestore. Check the billingMonths rule and try again.'
              : status === 'idle' && initializedMonthIds.includes(newMonthId) && newMonthId
                ? 'That month already exists.'
                : ''}
          </div>
        </div>
      )}

      {isDeleteOpen && (
        <div className="month-delete-panel">
          <div className="month-delete-warning" aria-hidden="true"><i className="fas fa-exclamation-triangle"></i></div>
          <div className="month-delete-copy">
            <strong>Delete {formatMonthLabel(activeMonthId)}?</strong>
            <span>This permanently deletes its payments, playing days, planned days and group charges.</span>
          </div>
          <div className="month-delete-confirmation">
            <label htmlFor="monthDeleteConfirmation">Type <strong>{activeMonthId}</strong> to confirm</label>
            <div className="month-delete-controls">
              <input
                id="monthDeleteConfirmation"
                value={deleteConfirmation}
                onChange={(event) => { setDeleteConfirmation(event.target.value); setDeleteStatus('idle'); }}
                placeholder={activeMonthId}
                disabled={deleteStatus === 'loading'}
                aria-invalid={deleteStatus === 'error'}
                autoComplete="off"
                autoFocus
              />
              <button
                className="month-delete-confirm"
                onClick={handleDelete}
                disabled={deleteConfirmation !== activeMonthId || deleteStatus === 'loading'}
              >
                <i className={deleteStatus === 'loading' ? 'fas fa-circle-notch fa-spin' : 'fas fa-trash-alt'} aria-hidden="true"></i>
                {deleteStatus === 'loading' ? 'Deleting' : 'Delete everything'}
              </button>
            </div>
            <div className="month-delete-status" aria-live="polite">
              {deleteStatus === 'error' ? 'Could not delete this month. Check your Firestore permissions and try again.' : ''}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MonthSelector;
