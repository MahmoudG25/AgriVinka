import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
