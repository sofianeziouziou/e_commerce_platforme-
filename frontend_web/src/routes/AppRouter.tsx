import { Navigate, Route, Routes } from 'react-router-dom';
import { CatalogPage } from '../features/catalog/CatalogPage';
import { ProductDetailPage } from '../features/catalog/ProductDetailPage';
import { HomePage } from '../features/home/HomePage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage';
import { ProfilePage } from '../features/auth/ProfilePage';
import { ProtectedRoute } from '../shared/ui/ProtectedRoute';
import { AdminDashboardPage } from '../features/admin/AdminDashboardPage';
import { AdminProductsPage } from '../features/admin/AdminProductsPage';
import { AdminCategoriesPage } from '../features/admin/AdminCategoriesPage';
import { AdminOrdersPage } from '../features/admin/AdminOrdersPage';
import { AdminInventoryPage } from '../features/admin/AdminInventoryPage';
import { AdminPromotionsPage } from '../features/admin/AdminPromotionsPage';
import { AdminCustomersPage } from '../features/admin/AdminCustomersPage';
import { AdminStatsPage } from '../features/admin/AdminStatsPage';
import { AdminSettingsPage } from '../features/admin/AdminSettingsPage';
import { AdminLoginPage } from '../features/admin/AdminLoginPage';
import { CartPage } from '../features/client/CartPage';
import { AddressManagementPage } from '../features/client/AddressManagementPage';
import { CheckoutPage } from '../features/client/CheckoutPage';
import { OrderHistoryPage } from '../features/client/OrderHistoryPage';
import { OrderDetailPage } from '../features/client/OrderDetailPage';
import { NotificationsPage } from '../features/client/NotificationsPage';

function AdminRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requireAdmin adminLoginPath="/admin/login">{children}</ProtectedRoute>;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/produits" element={<CatalogPage />} />
      <Route path="/produits/:slug" element={<ProductDetailPage />} />
      <Route path="/connexion" element={<LoginPage />} />
      <Route path="/inscription" element={<RegisterPage />} />
      <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
      <Route path="/reinitialiser-mot-de-passe" element={<ResetPasswordPage />} />
      <Route path="/profil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/panier" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
      <Route path="/adresses" element={<ProtectedRoute><AddressManagementPage /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
      <Route path="/commandes" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
      <Route path="/commandes/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

      <Route path="/admin" element={<AdminRoute><Navigate to="/admin/dashboard" replace /></AdminRoute>} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
      <Route path="/admin/produits" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
      <Route path="/admin/categories" element={<AdminRoute><AdminCategoriesPage /></AdminRoute>} />
      <Route path="/admin/stocks" element={<AdminRoute><AdminInventoryPage /></AdminRoute>} />
      <Route path="/admin/promotions" element={<AdminRoute><AdminPromotionsPage /></AdminRoute>} />
      <Route path="/admin/commandes" element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
      <Route path="/admin/clients" element={<AdminRoute><AdminCustomersPage /></AdminRoute>} />
      <Route path="/admin/statistiques" element={<AdminRoute><AdminStatsPage /></AdminRoute>} />
      <Route path="/admin/parametres" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />
    </Routes>
  );
}
