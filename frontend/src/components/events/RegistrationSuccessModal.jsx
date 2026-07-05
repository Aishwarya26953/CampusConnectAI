import { CheckCircle2, Calendar, MapPin, User, Hash } from "lucide-react";
import { Button } from "../ui";

export default function RegistrationSuccessModal({
  open,
  event,
  user,
  onClose,
}) {
  if (!open || !event) return null;

  const registrationId = `CCAI-${new Date().getFullYear()}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;

  const eventDate = new Date(event.event_date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">

        {/* Header */}

        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center py-8">

          <CheckCircle2 className="w-20 h-20 mx-auto mb-3" />

          <h2 className="text-3xl font-bold">
            Registration Successful
          </h2>

          <p className="mt-2 opacity-90">
            Your seat has been confirmed.
          </p>

        </div>

        {/* Body */}

        <div className="p-6 space-y-5">

          <div className="text-center">

            <h3 className="text-xl font-bold text-slate-800">
              Congratulations!
            </h3>

            <p className="text-slate-600 mt-2">
              <span className="font-semibold">{user?.name}</span>,
              you have successfully registered for
            </p>

            <p className="text-lg font-bold text-blue-600 mt-2">
              {event.title}
            </p>

          </div>

          <div className="border rounded-xl p-4 space-y-3 bg-slate-50">

            <div className="flex items-center gap-3">
              <Hash className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-slate-500">Registration ID</p>
                <p className="font-semibold">{registrationId}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-slate-500">Student</p>
                <p className="font-semibold">{user?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-slate-500">Event Date</p>
                <p className="font-semibold">{eventDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-slate-500">Venue</p>
                <p className="font-semibold">{event.venue}</p>
              </div>
            </div>

          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">

            <p className="text-green-700 text-sm text-center">

              🎉 Thank you for registering.

              <br />

              Please arrive at least <b>15 minutes early</b>.

            </p>

          </div>

          <Button
            className="w-full"
            onClick={onClose}
          >
            Done
          </Button>

        </div>

      </div>

    </div>
  );
}