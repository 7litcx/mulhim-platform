import { Metadata } from "next";
import ContactClient from "./contact-client";

export const metadata: Metadata = {
  title: "تواصل معنا | منصة مُلهم",
  description: "نحن هنا لمساعدتك والإجابة على أي استفسارات. تواصل معنا عبر البريد الإلكتروني، الهاتف، أو من خلال نموذج الاتصال وسيقوم فريقنا بالرد عليك في أقرب وقت.",
};

export default function ContactPage() {
  return <ContactClient />;
}
