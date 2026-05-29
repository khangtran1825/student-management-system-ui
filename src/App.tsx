import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { AppRoutes } from './routes';
import { Toaster } from './components/ui/sonner';
import { AuthBootstrap } from './components/AuthBootstrap';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthBootstrap />
        <AppRoutes />
        <Toaster />
      </BrowserRouter>
    </Provider>
  );
}

export default App;