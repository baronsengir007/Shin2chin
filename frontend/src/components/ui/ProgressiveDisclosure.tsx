import React, { useState, useEffect } from 'react';

interface ProgressiveDisclosureProps {
  children: React.ReactNode;
  advancedMode: boolean;
  onToggleMode: () => void;
}

interface DisclosureSection {
  id: string;
  title: string;
  level: 'basic' | 'intermediate' | 'advanced';
  defaultExpanded?: boolean;
}

export const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  children,
  advancedMode,
  onToggleMode,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [userExperience, setUserExperience] = useState<'beginner' | 'intermediate' | 'expert'>('beginner');

  // Auto-detect user experience based on usage patterns
  useEffect(() => {
    const storedExperience = localStorage.getItem('shin2chin-user-level');
    if (storedExperience) {
      setUserExperience(storedExperience as any);
    }
  }, []);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getVisibilityLevel = () => {
    if (advancedMode) return 'advanced';
    if (userExperience === 'expert') return 'advanced';
    if (userExperience === 'intermediate') return 'intermediate';
    return 'basic';
  };

  const shouldShowSection = (level: DisclosureSection['level']) => {
    const currentLevel = getVisibilityLevel();
    
    if (currentLevel === 'advanced') return true;
    if (currentLevel === 'intermediate' && level !== 'advanced') return true;
    if (currentLevel === 'basic' && level === 'basic') return true;
    
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Experience Level Indicator */}
      {!advancedMode && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300">
                Simple Mode Active
              </h3>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                Showing essential features only. Need more options?
              </p>
            </div>
            <button
              onClick={onToggleMode}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Show All
            </button>
          </div>
        </div>
      )}

      {/* Main Content with Conditional Sections */}
      <div className="space-y-4">
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement(child)) return child;

          // Check if child has disclosure props
          const childLevel = (child.props as any)?.disclosureLevel || 'basic';
          const childId = (child.props as any)?.disclosureId || `section-${index}`;
          const childTitle = (child.props as any)?.disclosureTitle;

          if (!shouldShowSection(childLevel) && !advancedMode) {
            return null;
          }

          // Wrap intermediate/advanced content in collapsible sections
          if (childLevel !== 'basic' && !advancedMode) {
            return (
              <CollapsibleSection
                key={childId}
                id={childId}
                title={childTitle || `Advanced ${childLevel} Options`}
                expanded={expandedSections.has(childId)}
                onToggle={() => toggleSection(childId)}
                level={childLevel}
              >
                {child}
              </CollapsibleSection>
            );
          }

          return child;
        })}
      </div>

      {/* Progressive Feature Discovery */}
      {!advancedMode && (
        <FeatureHints
          currentLevel={getVisibilityLevel()}
          onLevelUp={(newLevel) => {
            setUserExperience(newLevel);
            localStorage.setItem('shin2chin-user-level', newLevel);
          }}
        />
      )}
    </div>
  );
};

interface CollapsibleSectionProps {
  id: string;
  title: string;
  expanded: boolean;
  onToggle: () => void;
  level: 'basic' | 'intermediate' | 'advanced';
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  expanded,
  onToggle,
  level,
  children,
}) => {
  const getLevelColor = () => {
    switch (level) {
      case 'intermediate':
        return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20';
      case 'advanced':
        return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20';
      default:
        return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800';
    }
  };

  return (
    <div className={`border rounded-lg ${getLevelColor()}`}>
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {level === 'advanced' ? 'Advanced features' : 'Additional options'}
          </p>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="pt-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

interface FeatureHintsProps {
  currentLevel: 'basic' | 'intermediate' | 'advanced';
  onLevelUp: (level: 'beginner' | 'intermediate' | 'expert') => void;
}

const FeatureHints: React.FC<FeatureHintsProps> = ({ currentLevel, onLevelUp }) => {
  const [showHint, setShowHint] = useState(false);

  const hints = {
    basic: {
      title: "💡 Getting comfortable?",
      description: "Try intermediate features for more betting options",
      action: () => onLevelUp('intermediate'),
      actionText: "Show More Features"
    },
    intermediate: {
      title: "🚀 Ready for advanced tools?",
      description: "Unlock expert features for professional betting",
      action: () => onLevelUp('expert'),
      actionText: "Enable Expert Mode"
    },
    advanced: {
      title: "⭐ You're using all features!",
      description: "You have access to all platform capabilities",
      action: undefined,
      actionText: undefined
    }
  };

  const currentHint = hints[currentLevel];

  if (!currentHint.action) return null;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-medium text-purple-900 dark:text-purple-300">
            {currentHint.title}
          </h4>
          <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">
            {currentHint.description}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowHint(false)}
            className="text-purple-400 hover:text-purple-500"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {currentHint.action && (
            <button
              onClick={currentHint.action}
              className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              {currentHint.actionText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};