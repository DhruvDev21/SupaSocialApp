import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { wp } from '../helpers/Common';
import { theme } from '../constants/theme';

interface Step {
  label: string;
  completed: boolean;
}

interface ProgressBarProps {
  steps: Step[];
  isCanceled?: boolean;  // New optional prop
}

const ProgressBarOforder: React.FC<ProgressBarProps> = ({ steps, isCanceled }) => {
  const processedSteps = steps.reduce((acc, step, index) => {
    if (index === 0) {
      acc.push(step);
    } else {
      acc.push({
        ...step,
        completed: acc[index - 1].completed && step.completed
      });
    }
    return acc;
  }, [] as Step[]);

  return (
    <View style={styles.container}>
      {processedSteps.map((step, index) => (
        <View key={index} style={styles.stepContainer}>
          <View style={[
            styles.circle,
            step.completed && (isCanceled ? styles.canceledCircle : styles.completedCircle)
          ]}>
            {step.completed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.label}>{step.label}</Text>
          {index < steps.length - 1 && (
            <View style={[
              styles.line,
              step.completed && (isCanceled ? styles.canceledLine : styles.completedLine)
            ]} />
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingHorizontal: wp(3),
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: wp(8.5),
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedCircle: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  canceledCircle: {  // New red style for canceled status
    backgroundColor: theme.colors.rose,
    borderColor: theme.colors.rose,
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
  },
  label: {
    marginLeft: wp(4),
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textDark,
  },
  line: {
    position: 'absolute',
    top: 24,
    left: 11,
    width: 2,
    height: 25,
    backgroundColor: '#ccc',
    marginVertical: wp(1),
  },
  completedLine: {
    backgroundColor: theme.colors.primary,
  },
  canceledLine: {  // New red style for canceled status
    backgroundColor: theme.colors.rose,
  },
});

export default ProgressBarOforder;
