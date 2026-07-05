import { useState, useEffect } from "react";
import { Calendar, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

import { eventService } from "../../services";
import { useAuth } from "../../context/AuthContext";

import {
  Card,
  SkeletonCard,
  EmptyState,
  PageHeader,
  StatusBadge,
  Button,
} from "../../components/ui";

import EventRegistrationModal from "../../components/events/EventRegistrationModal";
import RegistrationSuccessModal from "../../components/events/RegistrationSuccessModal";

export default function StudentEvents() {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await eventService.list();
      setEvents(res.data);
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const openRegisterModal = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const confirmRegister = async () => {
    try {
      await eventService.register(selectedEvent.id);

      setShowModal(false);
      setShowSuccess(true);

      fetchEvents();
    } catch (err) {
      toast.error(
        err.response?.data?.detail || "Registration failed"
      );
    }
  };

  const handleUnregister = async (eventId) => {
    try {
      await eventService.unregister(eventId);

      toast.success("Successfully unregistered");

      fetchEvents();
    } catch (err) {
      toast.error(
        err.response?.data?.detail || "Unregistration failed"
      );
    }
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">

        <PageHeader
          title="Events"
          subtitle="Browse and register for campus events"
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} lines={3} />
            ))}
          </div>
        ) : events.length === 0 ? (
          <Card>
            <EmptyState
              icon={Calendar}
              title="No Events Available"
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {events.map((ev) => (
              <Card
                key={ev.id}
                className="p-5 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg">
                    {ev.title}
                  </h3>

                  <StatusBadge status={ev.status} />
                </div>

                <p className="text-sm text-gray-500 mb-2">
                  📅 {format(new Date(ev.event_date), "MMM dd, yyyy • hh:mm a")}
                </p>

                <p className="text-sm text-gray-500 mb-2">
                  📍 {ev.venue}
                </p>

                {ev.max_participants && (
                  <p className="text-sm text-gray-500 mb-4">
                    👥 {ev.registration_count || 0} / {ev.max_participants} Registered
                  </p>
                )}

                {ev.status === "approved" && (
                  <>
                    {ev.is_registered ? (
                      <Button
                        className="w-full"
                        variant="secondary"
                        onClick={() => handleUnregister(ev.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Unregister
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => openRegisterModal(ev)}
                        disabled={
                          ev.max_participants &&
                          ev.registration_count >= ev.max_participants
                        }
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Register
                      </Button>
                    )}
                  </>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      <EventRegistrationModal
        open={showModal}
        event={selectedEvent}
        user={user}
        onClose={() => {
          setShowModal(false);
          setSelectedEvent(null);
        }}
        onRegister={confirmRegister}
      />

      <RegistrationSuccessModal
        open={showSuccess}
        event={selectedEvent}
        user={user}
        onClose={() => {
          setShowSuccess(false);
          setSelectedEvent(null);
        }}
      />
    </>
  );
}