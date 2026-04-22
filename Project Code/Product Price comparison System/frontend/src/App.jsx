import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Search from './pages/Search';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Wishlist from './pages/Wishlist';
import Alerts from './pages/Alerts';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public Landing & Auth */}
              <Route path="/landing" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* All Functional Routes Now Strictly Protected */}
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
              <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />

              {/* Other Protected */}
              <Route path="/dashboard" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
              <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

              {/* 404 */}
              <Route path="*" element={
                <div className="empty-state" style={{ minHeight: '60vh' }}>
                  <h3>Page Not Found</h3>
                  <p>The page you're looking for doesn't exist.</p>
                  <a href="/" className="btn btn-primary">Go Home</a>
                </div>
              } />
            </Routes>

          </main>
          <Footer />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
