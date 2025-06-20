import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom';
import { Button, Result } from 'antd';
import App from './App.jsx'
import ProjectPage from './pages/projectsPage.jsx';
import PipelineConfigurator from './components/configures/pipelineConfigurator.jsx';
import SystemPerformanceMonitor from './components/displayData/systemPerformancerMonitor.jsx';
import TestPage from './pages/testPage.jsx';
import HomePage from './pages/homePage.jsx';

const NotFoundPage = () => (
  <Result
    status="404"
    title="404"
    subTitle="Desculpe, a página que você visitou ainda não foi implementada ou não existe."
    extra={<Button type="primary"><Link to="/">Voltar para o Início</Link></Button>}
  />
);

const router = createBrowserRouter([
   {
    path: '/',
    element: <HomePage />, 
    errorElement: NotFoundPage(),
  },
  {
    element: <App />,
    errorElement: NotFoundPage(),
    children: [
      {
        path: 'Dashboards', 
        element: <TestPage/>
      },
      {
        path: 'projects', 
        element: <ProjectPage/>
      },
      {
        path: 'pipelines',
        element: <PipelineConfigurator/>
      },
      {
        path: 'scripts',
        element: <SystemPerformanceMonitor/>
      },
      {
        path: 'settings',
        element: <NotFoundPage />, 
      },
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
