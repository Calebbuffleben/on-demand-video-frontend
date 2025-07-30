import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useOrganization } from '@clerk/nextjs';
import Link from 'next/link';
import { withAuth } from '@/lib/withAuth';

export default function MyVideosRedirectPage() {
  const router = useRouter();
  const { organization } = useOrganization();
  const { tenantId } = router.query;

  // Redirect to tenant-specific version if tenantId is available
  useEffect(() => {
    if (tenantId && typeof tenantId === 'string') {
      router.replace(`/${tenantId}/videos`);
    } else if (organization?.id) {
      // If no tenant ID in URL but user has an organization, redirect to that org's videos
      router.replace(`/${organization.id}/videos`);
    }
  }, [tenantId, organization, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Página de Vídeos</h1>
          <p className="text-gray-500 mb-6">Por favor, selecione uma organização para visualizar seus vídeos.</p>
          
          {organization ? (
            <Link 
              href={`/${organization.id}/videos`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Ir para Vídeos de {organization.name}
            </Link>
          ) : (
            <p className="text-amber-600">Nenhuma organização selecionada. Por favor, selecione uma organização primeiro.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Aplicar proteção de autenticação
export const getServerSideProps = withAuth(); 