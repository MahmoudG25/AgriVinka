import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminRoutes from './admin/routes/AdminRoutes';
import PublicRoutes from './routes/PublicRoutes';
import ScrollToTop from './components/common/ScrollToTop';
import MobileBottomNav from './components/layout/MobileBottomNav';
import ErrorBoundary from './components/common/ErrorBoundary';

import { AuthProvider } from './contexts/AuthContext';
import { themeService } from './services/themeService';

function App() {
	React.useEffect(() => {
		// Load and apply global theme settings on initial load
		themeService.getSettings()
			.then(settings => {
				if (settings) themeService.applyThemeToDOM(settings);
			})
			.catch(err => console.error('Failed to apply theme:', err));
	}, []);

	return (
		<ErrorBoundary>
			<Toaster
				position="top-center"
				toastOptions={{
					duration: 4000,
					style: {
						background: '#333',
						color: '#fff',
						fontFamily: 'inherit',
						borderRadius: '12px',
						padding: '12px 20px',
						fontSize: '14px',
					},
					success: {
						style: { background: '#166534', color: '#fff' },
						iconTheme: { primary: '#fff', secondary: '#166534' },
					},
					error: {
						style: { background: '#991b1b', color: '#fff' },
						iconTheme: { primary: '#fff', secondary: '#991b1b' },
					},
				}}
			/>
			<AuthProvider>
				<Router>
					<ScrollToTop />
					<div className="pb-20 md:pb-0 min-h-screen">
						<Routes>
							<Route path="/admin/*" element={<AdminRoutes />} />
							<Route path="/*" element={<PublicRoutes />} />
						</Routes>
					</div>
					<MobileBottomNav />
				</Router>
			</AuthProvider>
		</ErrorBoundary>
	);
}

export default App;
