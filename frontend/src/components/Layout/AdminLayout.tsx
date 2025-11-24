import { Link, Outlet, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './AdminLayout.css';

export default function AdminLayout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <div className="admin-layout">
            <aside className="sidebar">
                <div className="logo">
                    <h2>POS Admin</h2>
                </div>
                <nav className="nav-menu">
                    <Link to="/admin/products" className="nav-item">
                        📦 Products
                    </Link>
                    <Link to="/admin/categories" className="nav-item">
                        📁 Categories
                    </Link>
                    <Link to="/admin/brands" className="nav-item">
                        🏷️ Brands
                    </Link>
                    <Link to="/admin/variations" className="nav-item">
                        🎨 Variations
                    </Link>
                    <Link to="/admin/customers" className="nav-item">
                        👥 Customers
                    </Link>
                    <Link to="/admin/employees" className="nav-item">
                        👔 Employees
                    </Link>
                    <Link to="/admin/orders" className="nav-item">
                        🛒 Orders
                    </Link>
                    <Link to="/admin/pos" className="nav-item">
                        💳 POS Order
                    </Link>
                </nav>
                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        🚪 Logout
                    </button>
                </div>
            </aside>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
