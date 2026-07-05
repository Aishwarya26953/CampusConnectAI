import { useState, useEffect } from "react";
import { Calendar, MapPin, User, Mail, Phone, GraduationCap } from "lucide-react";
import { Button } from "../ui";

export default function EventRegistrationModal({
  open,
  event,
  user,
  onClose,
  onRegister,
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    semester: "",
    studentId: "",
    agree: false,
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        department: user.department?.name || user.department || "",
        semester: user.semester || "",
        studentId: user.student_id || "",
        agree: false,
      });
    }
  }, [user]);

  if (!open || !event) return null;

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    if (!form.agree) {
      alert("Please accept the terms and conditions.");
      return;
    }

    onRegister();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 animate-fade-in">

        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-slate-800">
            Event Registration
          </h2>

          <button
            onClick={onClose}
            className="text-2xl hover:text-red-500"
          >
            ×
          </button>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 mb-5">

          <h3 className="text-xl font-semibold">
            {event.title}
          </h3>

          <div className="mt-3 space-y-2 text-sm text-slate-600">

            <div className="flex items-center gap-2">
              <Calendar size={16} />
              {event.event_date}
            </div>

            <div className="flex items-center gap-2">
              <MapPin size={16} />
              {event.location}
            </div>

          </div>

        </div>

        <div className="grid md:grid-cols-2 gap-4">

          <div>
            <label className="text-sm font-medium">Student Name</label>

            <div className="relative mt-1">
              <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />

              <input
                className="input pl-10"
                name="name"
                value={form.name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>

            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />

              <input
                className="input pl-10"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Phone</label>

            <div className="relative mt-1">
              <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />

              <input
                className="input pl-10"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Student ID</label>

            <div className="relative mt-1">
              <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-gray-400" />

              <input
                className="input pl-10"
                name="studentId"
                value={form.studentId}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">
              Department
            </label>

            <input
              className="input mt-1"
              name="department"
              value={form.department}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Semester
            </label>

            <input
              className="input mt-1"
              name="semester"
              value={form.semester}
              onChange={handleChange}
            />
          </div>

        </div>

        <div className="mt-5 flex items-center gap-2">

          <input
            type="checkbox"
            name="agree"
            checked={form.agree}
            onChange={handleChange}
          />

          <span className="text-sm text-slate-600">
            I agree to participate in this event and follow all campus rules.
          </span>

        </div>

        <div className="flex justify-end gap-3 mt-6">

          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
          >
            Register Event
          </Button>

        </div>

      </div>

    </div>
  );
}