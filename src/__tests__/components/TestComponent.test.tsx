import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';

describe('Basic Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <View>
        <Text>Test Component</Text>
      </View>
    );
    expect(getByText('Test Component')).toBeTruthy();
  });
});
