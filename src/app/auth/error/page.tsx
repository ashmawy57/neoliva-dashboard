
import { ErrorPage } from '@/components/auth/ErrorPage';
import { AuthErrorCode } from '@/lib/auth-errors';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AuthErrorPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const type = (params.type as AuthErrorCode) || 'UNKNOWN_ERROR';
  const email = params.email as string | undefined;

  return <ErrorPage code={type} email={email} />;
}
