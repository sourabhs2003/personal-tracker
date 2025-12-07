import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LogStudy from './pages/LogStudy';
import LogMock from './pages/LogMock';
import Chapters from './pages/Chapters';
import ImportData from './pages/ImportData';
import Tasks from './pages/Tasks';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/log-study" element={<LogStudy />} />
          <Route path="/log-mock" element={<LogMock />} />
          <Route path="/chapters" element={<Chapters />} />
          <Route path="/import" element={<ImportData />} />
        </Routes>
      </Layout>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155'
          }
        }}
      />
    </Router>
  );
}

export default App;
