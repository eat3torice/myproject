import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/authService';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/Layout/AdminLayout';
import ProductList from './pages/admin/ProductList';
import CategoryList from './pages/admin/CategoryList';
import BrandList from './pages/admin/BrandList';
import VariationList from './pages/admin/VariationList';
import CustomerList from './pages/admin/CustomerList';
import EmployeeList from './pages/admin/EmployeeList';
import OrderList from './pages/admin/OrderList';
import POSOrder from './pages/admin/POSOrder';
import Shop from './pages/user/Shop';
import Cart from './pages/user/Cart';
import Orders from './pages/user/Orders';
import Profile from './pages/user/Profile';
import OrderDetail from './pages/user/OrderDetail';
import './App.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}

function UserProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login to access this page');
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* User routes */}
        <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<UserProtectedRoute><Cart /></UserProtectedRoute>} />
        <Route path="/orders" element={<UserProtectedRoute><Orders /></UserProtectedRoute>} />
        <Route path="/orders/:orderId" element={<UserProtectedRoute><OrderDetail /></UserProtectedRoute>} />
        <Route path="/profile" element={<UserProtectedRoute><Profile /></UserProtectedRoute>} />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="products" element={<ProductList />} />
          <Route path="categories" element={<CategoryList />} />
          <Route path="brands" element={<BrandList />} />
          <Route path="variations" element={<VariationList />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="pos" element={<POSOrder />} />
          <Route index element={<Navigate to="products" replace />} />
        </Route>

        <Route path="/" element={<Navigate to="/shop" replace />} />
      </Routes>
    </BrowserRouter>
  );
} export default App;
