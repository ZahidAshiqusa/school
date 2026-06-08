import { useBeforeInstallPrompt } from '../../hooks/useBeforeInstallPrompt';
import Button from './Button';

export default function InstallPWA() {
  const { isInstallable, promptInstall } = useBeforeInstallPrompt();

  if (!isInstallable) return null;

  return (
    <Button onClick={promptInstall} variant="secondary" size="md" className="flex items-center gap-2">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Install App
    </Button>
  );
}
