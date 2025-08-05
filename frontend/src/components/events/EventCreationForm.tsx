import React, { useState } from 'react';
import { CategorySelector } from './CategorySelector';
import { OddsConfiguration } from './OddsConfiguration';
import { useWalletConnection } from '../../hooks/store/useWalletConnection';
import { useToast } from '../../hooks/store/useUIState';
import { InputValidation } from '../../utils/validation/inputValidation';

interface EventForm {
  title: string;
  description: string;
  category: string;
  participants: string[];
  initialOdds: { [key: string]: number };
  startTime: string;
  endTime: string;
  settlingCriteria: string;
  isPublic: boolean;
  minimumBet: string;
  maximumBet: string;
}

export const EventCreationForm: React.FC = () => {
  const [step, setStep] = useState<'basic' | 'participants' | 'odds' | 'review' | 'publishing'>('basic');
  const [form, setForm] = useState<EventForm>({
    title: '',
    description: '',
    category: 'Sports',
    participants: ['', ''],
    initialOdds: {},
    startTime: '',
    endTime: '',
    settlingCriteria: '',
    isPublic: true,
    minimumBet: '0.1',
    maximumBet: '1000',
  });

  const { connected } = useWalletConnection();
  const { showSuccess, showError } = useToast();

  const handleInputChange = <K extends keyof EventForm>(field: K, value: EventForm[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addParticipant = () => {
    if (form.participants.length < 10) {
      setForm(prev => ({
        ...prev,
        participants: [...prev.participants, '']
      }));
    }
  };

  const updateParticipant = (index: number, value: string) => {
    const newParticipants = [...form.participants];
    newParticipants[index] = value;
    setForm(prev => ({ ...prev, participants: newParticipants }));
  };

  const removeParticipant = (index: number) => {
    if (form.participants.length > 2) {
      const newParticipants = form.participants.filter((_, i) => i !== index);
      setForm(prev => ({ ...prev, participants: newParticipants }));
    }
  };

  const validateCurrentStep = (): string | null => {
    switch (step) {
      case 'basic':
        const titleValidation = InputValidation.validateEventTitle(form.title);
        if (!titleValidation.isValid) return titleValidation.error!;
        
        const descValidation = InputValidation.validateBettingDescription(form.description);
        if (!descValidation.isValid) return descValidation.error!;
        
        return null;

      case 'participants':
        const filledParticipants = form.participants.filter(p => p.trim());
        if (filledParticipants.length < 2) {
          return 'At least 2 participants are required';
        }
        return null;

      case 'odds':
        if (Object.keys(form.initialOdds).length === 0) {
          return 'Please set initial odds for participants';
        }
        return null;

      default:
        return null;
    }
  };

  const nextStep = () => {
    const error = validateCurrentStep();
    if (error) {
      showError(error);
      return;
    }

    const steps: typeof step[] = ['basic', 'participants', 'odds', 'review', 'publishing'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: typeof step[] = ['basic', 'participants', 'odds', 'review', 'publishing'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const publishEvent = async () => {
    try {
      setStep('publishing');
      
      // Simulate event publishing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showSuccess('Event created successfully!');
      
      // Reset form
      setForm({
        title: '',
        description: '',
        category: 'Sports',
        participants: ['', ''],
        initialOdds: {},
        startTime: '',
        endTime: '',
        settlingCriteria: '',
        isPublic: true,
        minimumBet: '0.1',
        maximumBet: '1000',
      });
      setStep('basic');
      
    } catch (error) {
      showError('Failed to create event');
      setStep('review');
    }
  };

  if (!connected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Create New Event
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Connect your wallet to create betting events
          </p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Betting Event
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Step {['basic', 'participants', 'odds', 'review', 'publishing'].indexOf(step) + 1} of 5
          </p>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            {[
              { key: 'basic', label: 'Basic Info' },
              { key: 'participants', label: 'Participants' },
              { key: 'odds', label: 'Odds' },
              { key: 'review', label: 'Review' },
              { key: 'publishing', label: 'Publish' }
            ].map((s, index) => (
              <div key={s.key} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step === s.key 
                    ? 'bg-blue-600 text-white' 
                    : index < ['basic', 'participants', 'odds', 'review', 'publishing'].indexOf(step)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }
                `}>
                  {index < ['basic', 'participants', 'odds', 'review', 'publishing'].indexOf(step) ? '✓' : index + 1}
                </div>
                <span className={`ml-2 ${step === s.key ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}>
                  {s.label}
                </span>
                {index < 4 && <div className="w-8 h-px bg-gray-300 dark:bg-gray-600 mx-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="px-6 py-6">
          {step === 'basic' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Lakers vs Warriors Game 7"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the event and what people will be betting on..."
                />
              </div>

              <CategorySelector
                selectedCategory={form.category}
                onCategoryChange={(category) => handleInputChange('category', category)}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={form.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={form.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 'participants' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Event Participants
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Add the options that people can bet on (minimum 2 required)
                </p>
              </div>

              <div className="space-y-3">
                {form.participants.map((participant, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={participant}
                        onChange={(e) => updateParticipant(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Option ${index + 1} (e.g., Lakers, Over 200 points)`}
                      />
                    </div>
                    {form.participants.length > 2 && (
                      <button
                        onClick={() => removeParticipant(index)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {form.participants.length < 10 && (
                <button
                  onClick={addParticipant}
                  className="flex items-center space-x-2 px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Add Another Option</span>
                </button>
              )}
            </div>
          )}

          {step === 'odds' && (
            <OddsConfiguration
              participants={form.participants.filter(p => p.trim())}
              initialOdds={form.initialOdds}
              onOddsChange={(odds) => handleInputChange('initialOdds', odds)}
            />
          )}

          {step === 'review' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Review Event Details
              </h3>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{form.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{form.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Category:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{form.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Participants:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {form.participants.filter(p => p.trim()).length}
                    </span>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Participants & Odds:</h5>
                  <div className="space-y-2">
                    {form.participants.filter(p => p.trim()).map((participant, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-900 dark:text-white">{participant}</span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {form.initialOdds[participant]?.toFixed(2) || '2.00'}x
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'publishing' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Publishing Event...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Creating your betting event on the blockchain
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        {step !== 'publishing' && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
            <button
              onClick={prevStep}
              disabled={step === 'basic'}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            {step === 'review' ? (
              <button
                onClick={publishEvent}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Publish Event
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};