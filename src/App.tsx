import { createTheme, WuiProvider } from '@welcome-ui/core';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import JobIndex from './pages/JobIndex';
import Layout from './components/Layout';
import JobShow from './pages/JobShow';
import { QueryClient, QueryClientProvider } from 'react-query';

const theme = createTheme();

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '', element: <JobIndex /> },
      { path: 'jobs/:jobId', element: <JobShow /> },
    ],
  },
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 5,
      staleTime: 1000 * 60 * 5,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    },
  },
});

function App() {
  return (
    <WuiProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </WuiProvider>
  );
}

export default App;
