import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import AdminDashboardOverview from './AdminDashboardOverview';
import UsersManagement from './UsersManagement';
import CryptoNetworksPage from './CryptoNetworksPage';
import InvestmentPlansPage from './InvestmentPlansPage';
import DepositsPage from './DepositsPage';
import WithdrawalsPage from './WithdrawalsPage';
import KYCPage from './KYCPage';
import PlatformSettingsPage from './PlatformSettingsPage';
import AnnouncementsPage from './AnnouncementsPage';
import PaymentMethodsPage from './PaymentMethodsPage';
import AdminSupportTicketsPage from './AdminSupportTicketsPage';
import AdminSessionsPage from './AdminSessionsPage';
import AdminSwapItemsPage from './AdminSwapItemsPage';
import AdminDepotsWithdrawsPage from './AdminDepotsWithdrawsPage';

export default function AdminRouter({ onLogout, platformName }: { onLogout: () => void; platformName?: string }) {
  return (
    <AdminLayout onLogout={onLogout} platformName={platformName}>
      <Routes>
        <Route path="/" element={<AdminDashboardOverview />} />
        <Route path="/users" element={<UsersManagement />} />
        <Route path="/crypto-networks" element={<CryptoNetworksPage />} />
        <Route path="/investment-plans" element={<InvestmentPlansPage />} />
        <Route path="/deposits" element={<DepositsPage />} />
        <Route path="/withdrawals" element={<WithdrawalsPage />} />
        <Route path="/kyc" element={<KYCPage />} />
        <Route path="/settings" element={<PlatformSettingsPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/payment-methods" element={<PaymentMethodsPage />} />
        <Route path="/support-tickets" element={<AdminSupportTicketsPage />} />
        <Route path="/sessions" element={<AdminSessionsPage />} />
        <Route path="/swap-items" element={<AdminSwapItemsPage />} />
        <Route path="/depots-withdraws" element={<AdminDepotsWithdrawsPage />} />
      </Routes>
    </AdminLayout>
  );
}