import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { requestPermissionAndRegisterToken } from './requestNotificationPermission';
import { registerOnMessageHandler } from './firebase';

createRoot(document.getElementById("root")!).render(<App />);

// Register the Firebase Messaging service worker and request notification permission.
if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/firebase-messaging-sw.js')
		.then((registration) => {
			// Service worker registered.
			// Attempt to request notification permission and register token.
				requestPermissionAndRegisterToken().catch(() => {});
				// Register foreground message handler after service worker ready
				registerOnMessageHandler();
		})
		.catch(() => {});
} else {
	// Fallback: still try to request permission if possible
	requestPermissionAndRegisterToken().catch(() => {});
}
