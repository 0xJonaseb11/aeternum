import ContactForm from "~~/components/ContactForm";

export default function ContactSalesPage() {
  const formId = process.env.NEXT_PUBLIC_FORMSPREE_SALES_ID;

  return (
    <div className="flex flex-col min-h-screen bg-base-100">
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <ContactForm
              type="sales"
              title="Contact Sales"
              subtitle="Looking for enterprise-grade security, custom storage limits, or high-volume proof generation? Let's talk business."
              formId={formId}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
