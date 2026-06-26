'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

// dynamic import para evitar problemas de SSR no Next.js
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocPage() {
  return (
    <section className="bg-white min-h-screen py-8">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">
          Documentação - InspectAI
        </h1>
        <SwaggerUI url="/api/swagger" />
      </div>
    </section>
  );
}