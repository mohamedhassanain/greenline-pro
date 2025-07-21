import React, { useEffect, useState } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, EventProps } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { View } from 'react-big-calendar';

const locales = {
  'fr': fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

type AgendaEvent = {
  id: string;
  title: string;
  description: string;
  start: Date;  
  end: Date;    
  color: string;
};


const CustomToolbar = (toolbar: any) => {
  return (
    <div className="rbc-toolbar" style={{ marginBottom: '15px' }}>
      <span className="rbc-btn-group" style={{ display: 'flex', gap: '8px' }}>
        <button 
          type="button" 
          onClick={() => toolbar.onNavigate('TODAY')}
          style={{
            padding: '6px 12px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Aujourd'hui
        </button>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button 
            type="button" 
            onClick={() => toolbar.onNavigate('PREV')}
            style={{
              padding: '6px 10px',
              backgroundColor: '#f0f0f0',
              border: '1px solid #ccc',
              borderTopLeftRadius: '4px',
              borderBottomLeftRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ❮
          </button>
          <button 
            type="button" 
            onClick={() => toolbar.onNavigate('NEXT')}
            style={{
              padding: '6px 10px',
              backgroundColor: '#f0f0f0',
              border: '1px solid #ccc',
              borderTopRightRadius: '4px',
              borderBottomRightRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ❯
          </button>
        </div>
      </span>
      
      <span className="rbc-toolbar-label" style={{
        flex: '1',
        textAlign: 'center',
        fontSize: '1.2em',
        fontWeight: 'bold'
      }}>
        {toolbar.label}
      </span>
      
      <span className="rbc-btn-group" style={{ display: 'flex', gap: '8px' }}>
        <button 
          type="button" 
          onClick={() => toolbar.onView('month')}
          style={{
            padding: '6px 12px',
            backgroundColor: toolbar.view === 'month' ? '#e6e6e6' : '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: toolbar.view === 'month' ? 'bold' : 'normal'
          }}
        >
          Mois
        </button>
        <button 
          type="button" 
          onClick={() => toolbar.onView('week')}
          style={{
            padding: '6px 12px',
            backgroundColor: toolbar.view === 'week' ? '#e6e6e6' : '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: toolbar.view === 'week' ? 'bold' : 'normal'
          }}
        >
          Semaine
        </button>
        <button 
          type="button" 
          onClick={() => toolbar.onView('day')}
          style={{
            padding: '6px 12px',
            backgroundColor: toolbar.view === 'day' ? '#e6e6e6' : '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: toolbar.view === 'day' ? 'bold' : 'normal'
          }}
        >
          Jour
        </button>
        <button 
          type="button" 
          onClick={() => toolbar.onView('agenda')}
          style={{
            padding: '6px 12px',
            backgroundColor: toolbar.view === 'agenda' ? '#e6e6e6' : '#f0f0f0',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: toolbar.view === 'agenda' ? 'bold' : 'normal'
          }}
        >
          Liste
        </button>
      </span>
    </div>
  );
};

export default function Agenda() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<View>('month');

  // Charger tous les événements au chargement
  useEffect(() => {
    setLoading(true);
    fetch('/api/agenda', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setEvents(data.events || []);
        setLoading(false);
      })
      .catch(() => {
        setMessage("Erreur lors du chargement de l'agenda");
        setLoading(false);
      });
  }, []);

  // État pour la modale et le formulaire
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    color: '#1976d2', // couleur par défaut (bleu)
  });

  // Pour la suppression
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Pour l'édition
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    color: '#1976d2',
  });

  // Ouvre la modale avec les infos du slot sélectionné
  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setForm({
      title: '',
      description: '',
      start: start.toISOString(),
      end: end.toISOString(),
      color: '#1976d2',
    });
    setShowModal(true);
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          start: form.start,
          end: form.end,
          color: form.color,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Erreur lors de l'ajout du rendez-vous");
        setLoading(false);
        return;
      }
      setShowModal(false);
      setEvents([...events, data.event]);
    } catch (err) {
      setMessage("Erreur réseau ou serveur lors de l'ajout du rendez-vous");
    }
    setLoading(false);
  };

  // Handler pour sélectionner un event (clic sur event)
  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
    setEditForm({
      title: event.title,
      description: event.description,
      start: new Date(event.start).toISOString().slice(0, 16),
      end: new Date(event.end).toISOString().slice(0, 16),
      color: event.color || '#1976d2',
    });
    setIsEditingEvent(false);
    setShowDeleteModal(true);
  };

  // Handler pour passer en mode édition
  const handleEditEvent = () => {
    setIsEditingEvent(true);
  };

  // Handler pour enregistrer la modification
  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`/api/agenda/${selectedEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          start: new Date(editForm.start).toISOString(),
          end: new Date(editForm.end).toISOString(),
          color: editForm.color,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Erreur lors de la modification du rendez-vous");
        setLoading(false);
        return;
      }
      setEvents(events.map(e => e.id === selectedEvent.id ? data.event : e));
      setShowDeleteModal(false);
      setSelectedEvent(null);
      setIsEditingEvent(false);
    } catch (err) {
      setMessage("Erreur réseau ou serveur lors de la modification du rendez-vous");
    }
    setLoading(false);
  };

  // Handler suppression
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`/api/agenda/${selectedEvent.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      setEvents(events.filter(e => e.id !== selectedEvent.id));
      setShowDeleteModal(false);
      setSelectedEvent(null);
    } catch (err) {
      setMessage('Erreur lors de la suppression');
    }
    setLoading(false);
  };

  // Modale de formulaire d'ajout
  const renderModal = () => (
    showModal && (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <form onSubmit={handleAddEvent} style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 320 }}>
          <h2>Ajouter un rendez-vous</h2>
          <div style={{ marginBottom: 12 }}>
            <input
              type="text"
              placeholder="Titre"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
              style={{ width: '100%', padding: 8 }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              style={{ width: '100%', padding: 8 }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Début: <input type="datetime-local" value={form.start ? new Date(form.start).toISOString().slice(0,16) : ''} onChange={e => setForm({ ...form, start: new Date(e.target.value).toISOString() })} required /></label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Fin: <input type="datetime-local" value={form.end ? new Date(form.end).toISOString().slice(0,16) : ''} onChange={e => setForm({ ...form, end: new Date(e.target.value).toISOString() })} required /></label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Couleur : <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} /></label>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={loading}>Ajouter</button>
            <button type="button" onClick={() => setShowModal(false)}>Annuler</button>
          </div>
        </form>
      </div>
    )
  );

  // Modale de suppression/édition
  const renderDeleteModal = () => (
    showDeleteModal && (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <form onSubmit={isEditingEvent ? handleUpdateEvent : undefined} style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 320 }}>
          <h2>{isEditingEvent ? 'Modifier le rendez-vous' : 'Supprimer ou modifier ce rendez-vous ?'}</h2>
          {isEditingEvent ? (
            <>
              <div style={{ marginBottom: 12 }}>
                <input
                  type="text"
                  placeholder="Titre"
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: 8 }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <textarea
                  placeholder="Description"
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  style={{ width: '100%', padding: 8 }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label>Début: <input type="datetime-local" value={editForm.start} onChange={e => setEditForm({ ...editForm, start: e.target.value })} required /></label>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label>Fin: <input type="datetime-local" value={editForm.end} onChange={e => setEditForm({ ...editForm, end: e.target.value })} required /></label>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label>Couleur : <input type="color" value={editForm.color} onChange={e => setEditForm({ ...editForm, color: e.target.value })} /></label>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" disabled={loading}>Enregistrer</button>
                <button type="button" onClick={() => setIsEditingEvent(false)}>Annuler</button>
              </div>
            </>
          ) : (
            <>
              <p>{selectedEvent?.title}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button type="button" onClick={handleEditEvent}>Modifier</button>
                <button onClick={handleDeleteEvent} disabled={loading}>Supprimer</button>
                <button type="button" onClick={() => setShowDeleteModal(false)}>Annuler</button>
              </div>
            </>
          )}
        </form>
      </div>
    )
  );

  // Composant personnalisé pour le rendu des événements
  const CustomEvent = (props: EventProps<AgendaEvent>) => {
    const { event } = props;
    return (
      <div 
        style={{
          height: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          padding: '2px 4px',
          fontSize: '0.85em',
          backgroundColor: event.color || '#1976d2',
          color: '#fff',
          borderRadius: '4px',
          border: 'none',
        }}
        title={event.title} // Affiche le texte complet au survol
      >
        {event.title}
      </div>
    );
  };

  return (
    <div style={{ padding: 24, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 'bold' }}>Agenda</h1>
        <span style={{ fontSize: 18, color: '#666' }}>
          {format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })}
        </span>
      </div>
      
      {loading && <p>Chargement...</p>}
      {message && <p style={{ color: 'red' }}>{message}</p>}
      
      <div style={{ height: 'calc(100vh - 180px)' }}>
        <BigCalendar
          localizer={localizer}
          events={events.map(e => ({
            ...e,
            start: new Date(e.start),
            end: new Date(e.end),
            allDay: false
          }))}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          messages={{
            today: 'Aujourd\'hui',
            previous: 'Précédent',
            next: 'Suivant',
            month: 'Mois',
            week: 'Semaine',
            day: 'Jour',
            agenda: 'Liste',
            date: 'Date',
            time: 'Heure',
            event: 'Événement',
            noEventsInRange: 'Aucun événement',
          }}
          culture="fr"
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.color || '#1976d2',
              color: '#fff',
              borderRadius: '4px',
              border: 'none',
              padding: '2px 5px',
              fontSize: '0.85em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }
          })}
          date={currentDate}
          onNavigate={setCurrentDate}
          onView={setCurrentView}
          view={currentView}
          components={{
            toolbar: CustomToolbar,
            event: CustomEvent,
          }}
          defaultView="month"
        />
      </div>
      
      {renderModal()}
      {renderDeleteModal()}
    </div>
  );
}