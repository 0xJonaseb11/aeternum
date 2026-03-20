import ContactForm from "~~/components/ContactForm";

export default function ContactSupportPage() {
  const formId = process.env.NEXT_PUBLIC_FORMSPREE_HELP_ID;

  return (
    <div className="flex flex-col min-h-screen bg-base-100">
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <ContactForm
              type="support"
              title="Technical Support"
              subtitle="Need help with encryption, storage, or your account? Our engineers are ready to assist you."
              formId={formId}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
