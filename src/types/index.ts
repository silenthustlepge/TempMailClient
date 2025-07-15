export interface GeneratedEmail {
  email: string;
  token: string;
}

export interface Email {
  id: string;
  from: string;
  subject: string;
  date: string;
  body: string;
  preview: string;
}
