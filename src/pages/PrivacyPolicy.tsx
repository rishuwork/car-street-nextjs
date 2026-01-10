import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <SEO
                title="Privacy Policy"
                description="Privacy Policy for Car Street"
                url="https://carstreet.ca/privacy-policy"
            />
            <Header />
            <main className="flex-1 py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h1 className="text-3xl md:text-4xl font-heading font-bold mb-8">Privacy Policy</h1>

                    <div className="prose prose-slate max-w-none">
                        <p className="mb-6">
                            This Privacy Policy describes the practices and procedures regarding the collection, use, and protection of personal and non-personal information collected from you through this website. Our primary goal is to maintain transparency in how we handle information, ensuring that your privacy and security are respected. Please review this policy carefully to understand our data collection and usage practices.
                        </p>

                        <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">1. Purpose and Scope</h2>
                        <p>
                            The purpose of this Privacy Policy is to inform you of the types of information that may be collected from you, how that information may be used, and the choices you have regarding your personal data. This policy applies solely to information collected through this website and does not extend to other websites, including those linked to or from this website. We encourage you to review the privacy policies of any website you visit.
                        </p>

                        <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">2. Information We Collect</h2>
                        <ul className="list-disc pl-6 space-y-2 mb-4">
                            <li>
                                <strong>Personally Identifiable Information (PII):</strong> We may collect personal information such as your name, email address, phone number, mailing address, or other contact details when you voluntarily provide it through forms, applications, or other direct communication with us. This information is collected to facilitate requested services, respond to inquiries, and enhance your experience with us.
                            </li>
                            <li>
                                <strong>Non-Personally Identifiable Information (Non-PII):</strong> During regular visits, we may collect non-personal information, such as browsing data, page views, time spent on specific pages, and aggregate information that helps us analyze site usage. This information is collected using cookies, session logs, and other analytics tools and is used to improve our website's layout, features, and functionality.
                            </li>
                            <li>
                                <strong>Children's Data:</strong> We are committed to protecting children's privacy and do not knowingly collect personal information from children under the age of 18. Should any data be inadvertently collected from a minor, we encourage parents or guardians to contact us immediately, and we will promptly delete the information.
                            </li>
                        </ul>

                        <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
                        <p className="mb-2">The information collected from you may be used in the following ways:</p>
                        <ul className="list-disc pl-6 space-y-2 mb-4">
                            <li><strong>Fulfilment of Requests:</strong> To respond to inquiries, process service requests, or provide the necessary information, such as quotes, products, or customer support.</li>
                            <li><strong>Marketing and Promotional Communication:</strong> To inform you of new products, special offers, or other information relevant to your interests. You may opt out of these communications at any time.</li>
                            <li><strong>Data Aggregation and Site Analytics:</strong> To track visitor behavior and improve website functionality, layout, and content based on aggregate site activity metrics.</li>
                            <li><strong>Legal Compliance and Other Authorized Uses:</strong> To comply with legal obligations or respond to lawful requests, as well as other authorized business activities.</li>
                        </ul>

                        <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">4. Security of Information</h2>
                        <p>
                            We prioritize the security of your information and implement various technical and organizational measures to protect your data against unauthorized access, alteration, or disclosure. Sensitive information (such as credit card data) submitted through the website is encrypted and stored securely. Access to personal information is restricted to employees who require it for specific business tasks, such as customer service or billing.
                        </p>

                        <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">5. Sharing and Disclosure of Information</h2>
                        <p className="mb-2">
                            We are committed to protecting your privacy and will not sell or rent your personally identifiable information to third parties. However, we may share your information under specific conditions, such as:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mb-4">
                            <li><strong>Third-Party Service Providers:</strong> We may share your information with third-party providers who assist in delivering products or services, such as shipping, payment processing, or website maintenance. These parties are bound to handle your information in compliance with our privacy standards and applicable law.</li>
                            <li><strong>Legal Obligations:</strong> We may disclose your information if required by law or if we believe in good faith that such action is necessary to comply with legal requirements, protect our rights, or respond to judicial processes.</li>
                            <li><strong>Business Partners and Affiliates:</strong> We may share non-personally identifiable information with business partners to enhance service offerings, improve marketing efforts, or develop new services. Personal information may be shared with affiliates solely to fulfill requests you have made through our website.</li>
                            <li><strong>Protection of Car Street and Others:</strong> In the event of potential harm to users, Car Street, or the public, we may share information as part of necessary precautions or protective actions.</li>
                        </ul>

                        <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">6. Third-Party Links and Advertisements</h2>
                        <p className="mb-4">
                            Our website may contain links to external websites for your convenience. Please note that we do not control these third-party sites, and their privacy practices may differ from ours. We encourage you to review the privacy policies of any website you visit, as we are not responsible for their content, security, or data handling.
                        </p>
                        <p>
                            When using embedded applications, such as an online financing application provided by a third-party service, we advise you to read the privacy policy specific to that service to understand how your data is collected, used, and shared.
                        </p>

                        <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">7. Your Rights and Choices</h2>
                        <p className="mb-2">You have several rights concerning your personal data and our use of it, including:</p>
                        <ul className="list-disc pl-6 space-y-2 mb-4">
                            <li><strong>Access and Update:</strong> You may request to review, update, or correct any information we have about you by contacting us through the contact information provided on our website.</li>
                            <li><strong>Opt-Out of Communications:</strong> You may choose to opt out of receiving marketing or promotional communications at any time. Simply follow the opt-out instructions in any email we send or contact us directly to be removed from future communications.</li>
                            <li><strong>Data Deletion:</strong> If you wish to have your personal information removed from our records, please contact us, and we will take reasonable steps to delete it, subject to legal or operational requirements.</li>
                            <li><strong>Raise Concerns:</strong> If you have any concerns regarding our use of your data, please reach out to us. We are committed to addressing privacy-related inquiries or resolving any issues promptly.</li>
                        </ul>

                        <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">8. Policy Updates and Revisions</h2>
                        <p>
                            This Privacy Policy may be revised periodically to reflect changes in our practices or for other operational, legal, or regulatory reasons. Any updates or changes to this policy will be posted prominently on our website, and the revised policy will apply only to data collected after the effective date of the change. By continuing to use our site, you consent to the current terms of the Privacy Policy in effect at the time of your use. If you do not agree to any modifications, please discontinue use of the site.
                        </p>

                        <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">9. Accountability</h2>
                        <p className="mb-4">
                            Car Street is committed to ensuring the accuracy and protection of the information collected through our website. We take all reasonable measures to confirm that personal data is handled in a manner consistent with this Privacy Policy and industry standards.
                        </p>
                        <p>
                            Please be aware that our website may contain links to external sites managed by third parties. We do not control these external sites, and our Privacy Policy does not extend to them. We recommend that you review the privacy practices of any site you visit from links on our platform, especially before providing personal information.
                        </p>

                        <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">10. Security of Information</h2>
                        <p className="mb-2">
                            We take comprehensive precautions to protect your personal data. When you submit sensitive information on our website, your data is protected both online and offline.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mb-4">
                            <li><strong>Encryption:</strong> For sensitive data, such as credit card information, we use encryption protocols to ensure secure transmission. You can verify this by looking for a closed lock icon in your browser or "https" in the web address.</li>
                            <li><strong>Data Access:</strong> Access to personal information is restricted to employees and service providers who need it to perform specific tasks, such as processing billing or customer service requests. Our servers and systems are housed in secure environments to prevent unauthorized access.</li>
                        </ul>
                        <p>
                            Despite these measures, it is important to note that no online transmission is entirely secure, and we cannot guarantee complete data security. We urge users to exercise caution and take measures to protect their own information when using the internet.
                        </p>

                        <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">11. Indemnification</h2>
                        <p>
                            As a condition of using this website and its services, you agree to indemnify Car Street, including its partners, suppliers, and associated service providers, from any and all claims, liabilities, expenses, or damages arising from your use of the website. This includes any legal fees incurred due to your failure to comply with this Privacy Policy or any breach by you of these terms. This indemnification applies to all claims resulting from your use of the website, including, without limitation, any issues related to user content, your violation of third-party rights, or any unauthorized access to the site.
                        </p>

                        <h2 className="text-2xl font-heading font-semibold mt-8 mb-4">12. Contact Us</h2>
                        <p>
                            If you have any questions, concerns, or feedback regarding this Privacy Policy, please do not hesitate to contact us. We are committed to addressing any inquiries promptly and ensuring that our practices align with our commitment to transparency and user privacy.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
