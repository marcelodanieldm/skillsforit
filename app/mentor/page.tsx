import { redirect } from 'next/navigation';

export default function MentorRedirect() {
  redirect('/mentor/dashboard');
  return null;
}
