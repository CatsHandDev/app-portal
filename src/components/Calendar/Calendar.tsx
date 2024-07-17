import React, { useEffect, useState } from 'react';
import styles from './calendar.module.scss';
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import EventModal from './EventModal';
import { Event } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, Timestamp } from 'firebase/firestore';

const localizer = momentLocalizer(moment);

interface MyCalendarProps {
  view: View;
  setView: (view: View) => void;
  userId: string;
}

const MyCalendar: React.FC<MyCalendarProps> = ({ view, setView, userId }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsCollectionRef = collection(db, 'users', userId, 'calendar');
        const eventsQuery = query(eventsCollectionRef);
        const eventsSnapshot = await getDocs(eventsQuery);
        const fetchedEvents: Event[] = [];
        eventsSnapshot.forEach((doc) => {
          const eventData = doc.data();
          const start = eventData.start instanceof Timestamp ? eventData.start.toDate() : new Date(eventData.start);
          const end = eventData.end instanceof Timestamp ? eventData.end.toDate() : new Date(eventData.end);
          fetchedEvents.push({
            id: doc.id,
            title: eventData.title,
            start,
            end,
            allDay: eventData.allDay,
            resource: eventData.resource
          });
        });
        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    if (userId) {
      fetchEvents();
    }
  }, [userId]);

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setNewEvent({ start, end });
    setIsModalOpen(true);
  };

  const handleNavigate = (date: Date, view: View) => {
    setCurrentDate(date);
    setView(view);
  };

  const handleSaveEvent = (event: Partial<Event>) => {
    const newEvent: Event = {
      id: event.id || '',
      title: event.title || '',
      start: event.start || new Date(),
      end: event.end || new Date(),
      allDay: true,
      resource: null
    };
    setEvents([...events, newEvent]);
    setIsModalOpen(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  const handleEventClick = (event: Event) => {
    setNewEvent(event);
    setIsModalOpen(true);
  };

  return (
    <div className={styles.calendarContainer}>
      <Calendar
        key={currentDate.toISOString()}
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelectSlot}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        defaultView={Views.MONTH}
        style={{ height: 500 }}
        onView={(newView) => setView(newView as View)}
        view={view}
        date={currentDate}
        onNavigate={handleNavigate}
        onSelectEvent={handleEventClick}
      />
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        event={newEvent}
        userId={userId}
      />
    </div>
  );
};

export default MyCalendar;
