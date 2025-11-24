import dynamic from 'next/dynamic';

/**
 * Dynamic Imports for Code Splitting
 * 
 * Lazy load heavy components to reduce initial bundle size
 */

// Charts (heavy library - recharts)
export const DynamicLineChart = dynamic(
  () => import('@/components/widgets/LineChart').then(mod => mod.LineChart),
  {
    loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded" />,
    ssr: false,
  }
);

export const DynamicPieChart = dynamic(
  () => import('@/components/widgets/PieChart').then(mod => mod.PieChart),
  {
    loading: () => <div className="animate-pulse h-64 bg-gray-200 rounded" />,
    ssr: false,
  }
);

// Rich Text Editor (heavy - slate/tiptap)
export const DynamicRichEditor = dynamic(
  () => import('@/components/features/RichEditor').then(mod => mod.RichEditor),
  {
    loading: () => (
      <div className="border rounded p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    ),
    ssr: false,
  }
);

// PDF Invoice Generator (jsPDF)
export const DynamicInvoiceGenerator = dynamic(
  () => import('@/components/features/InvoiceGenerator'),
  {
    loading: () => <div>Loading invoice generator...</div>,
    ssr: false,
  }
);

// QR Code Generator
export const DynamicQRCode = dynamic(
  () => import('@/components/features/QRCodeDisplay'),
  {
    loading: () => <div className="w-32 h-32 bg-gray-200 animate-pulse" />,
    ssr: false,
  }
);

// Modal (only load when needed)
export const DynamicModal = dynamic(
  () => import('@/components/shared/Modal').then(mod => mod.Modal),
  {
    ssr: false,
  }
);

// Admin Dashboard (admin-only)
export const DynamicAdminDashboard = dynamic(
  () => import('@/components/admin/Dashboard'),
  {
    loading: () => <div>Loading admin dashboard...</div>,
    ssr: false,
  }
);
