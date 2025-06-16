import { Survey, Response, User } from '../types';
import SurveyStats from './SurveyStats';

interface SurveyStatsModalProps {
  survey: Survey;
  responses: Response[];
  users: User[];
  onClose: () => void;
}

export default function SurveyStatsModal({ survey, responses, users, onClose }: SurveyStatsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">{survey.title} - İstatistikler</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <SurveyStats survey={survey} responses={responses} users={users} />
        </div>
      </div>
    </div>
  );
}
