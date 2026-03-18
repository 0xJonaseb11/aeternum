"use client";

import { useState } from "react";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface ContactFormProps {
  formId: string | undefined;
  title: string;
  subtitle: string;
  type: "support" | "sales";
}

export default function ContactForm({ formId, title, subtitle, type }: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formId) {
      setErrorMessage("Form configuration is missing. Please contact administrator.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`https://formspree.io/f/${formId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setStatus("success");
      } else {
        throw new Error("Failed to submit form");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again later.");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-base-100 p-12 rounded-[2.5rem] shadow-2xl border border-success/20 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-success/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircleIcon className="h-10 w-10 text-success" />
        </div>
        <h2 className="text-3xl font-black mb-4">Message Received!</h2>
        <p className="text-base-content/60 mb-8 max-w-sm mx-auto">
          Thank you for reaching out. Our {type === "support" ? "technical team" : "sales representative"} will get back
          to you shortly.
        </p>
        <button onClick={() => setStatus("idle")} className="btn btn-ghost border border-base-300 rounded-2xl px-8">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-base-100 p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-base-300">
      <h2 className="text-3xl font-black mb-2">{title}</h2>
      <p className="text-base-content/60 mb-10 text-sm leading-relaxed">{subtitle}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold opacity-60">Full Name</span>
            </label>
            <input
              name="name"
              type="text"
              placeholder="John Doe"
              required
              className="input input-bordered w-full rounded-2xl bg-base-200 border-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold opacity-60">Email Address</span>
            </label>
            <input
              name="email"
              type="email"
              placeholder="john@example.com"
              required
              className="input input-bordered w-full rounded-2xl bg-base-200 border-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
            />
          </div>
        </div>

        {type === "sales" && (
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold opacity-60">Company / Organization</span>
            </label>
            <input
              name="organization"
              type="text"
              placeholder="Aeternum Labs"
              required={type === "sales"}
              className="input input-bordered w-full rounded-2xl bg-base-200 border-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
            />
          </div>
        )}

        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold opacity-60">Subject</span>
          </label>
          <input
            name="subject"
            type="text"
            placeholder={type === "support" ? "Issue with vault encryption" : "Enterprise plan inquiry"}
            required
            className="input input-bordered w-full rounded-2xl bg-base-200 border-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-bold opacity-60">Message</span>
          </label>
          <textarea
            name="message"
            rows={5}
            placeholder="Tell us more about how we can help..."
            required
            className="textarea textarea-bordered w-full rounded-2xl bg-base-200 border-none focus:ring-4 focus:ring-primary/10 transition-all font-medium text-lg leading-relaxed pt-4"
          ></textarea>
        </div>

        {status === "error" && (
          <div className="alert alert-error rounded-2xl border-none bg-error/10 text-error flex items-center gap-3 py-4">
            <ExclamationTriangleIcon className="h-5 w-5" />
            <span className="text-sm font-bold">{errorMessage}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className={`btn btn-primary btn-block btn-lg rounded-2xl transition-all shadow-xl shadow-primary/20 ${status === "submitting" ? "loading" : ""}`}
        >
          {status === "submitting" ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}
