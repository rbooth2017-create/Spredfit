import { toast } from 'sonner@2.0.3';
import { APIClient } from '../utils/api';
import { useAuth } from '../utils/auth';
import { useApp } from '../utils/AppContext';

export function useLeagueOperations() {
  const { accessToken } = useAuth();
  const { refreshLeagues } = useApp();

  const createLeague = async (
    name: string,
    mode: 'individual' | 'team',
    startDate: string,
    endDate: string,
    closeModal: () => void,
    resetForm: () => void
  ) => {
    if (!name || !startDate || !endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const api = new APIClient(accessToken);
      const result = await api.createLeague({
        name,
        mode,
        startDate,
        endDate,
      });

      toast.success(`League created! Invite code: ${result.inviteCode}`);
      closeModal();
      resetForm();
      await refreshLeagues();
    } catch (error) {
      console.error('Error creating league:', error);
      toast.error('Failed to create league');
    }
  };

  const joinLeague = async (
    code: string,
    closeModal: () => void,
    resetForm: () => void
  ) => {
    if (!code) {
      toast.error('Please enter an invite code');
      return;
    }

    try {
      const api = new APIClient(accessToken);
      await api.joinLeague(code);
      toast.success('Joined league successfully!');
      closeModal();
      resetForm();
      await refreshLeagues();
    } catch (error) {
      console.error('Error joining league:', error);
      toast.error('Failed to join league');
    }
  };

  return {
    createLeague,
    joinLeague,
  };
}
